const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Настройки
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wintozo-secret-key-2024';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// База данных в памяти (для быстрой работы на Render/Railway)
const db = {
  users: [],
  chats: [],
  messages: []
};

// Функция для генерации аватара
const generateAvatar = (name) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#A8E6CF'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.replace('#', '')}&color=fff&size=150`;
};

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

// --- HTTP API ---

// 1. Проверка здоровья (чтобы сервер не засыпал)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
});

// 2. Регистрация
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (db.users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      avatar: generateAvatar(username),
      isOnline: true,
      lastSeen: new Date().toISOString()
    };

    db.users.push(newUser);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 3. Логин
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username);

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Неверный пароль' });

    user.isOnline = true;
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({ user: userResponse, token });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 4. Поиск пользователей
app.get('/api/v1/users/search', authenticateToken, (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const users = db.users
    .filter(u => u.username.toLowerCase().includes(query) && u.id !== req.user.id)
    .map(u => ({ id: u.id, username: u.username, avatar: u.avatar, isOnline: u.isOnline }));
  res.json(users);
});

// 5. Получение чатов
app.get('/api/v1/chats', authenticateToken, (req, res) => {
  const userChats = db.chats.filter(c => c.participants.some(p => p.id === req.user.id));
  res.json(userChats);
});

// 6. Получение сообщений
app.get('/api/v1/messages/:chatId', authenticateToken, (req, res) => {
  const messages = db.messages.filter(m => m.chatId === req.params.chatId);
  res.json(messages);
});

// --- WebSockets (Real-time) ---
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  socket.on('authenticate', ({ token }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      
      const user = db.users.find(u => u.id === decoded.id);
      if (user) {
        user.isOnline = true;
        io.emit('userStatus', { userId: user.id, isOnline: true });
      }
    } catch (e) {
      console.log('Ошибка токена WS:', e.message);
    }
  });

  socket.on('join', (chatId) => {
    socket.join(chatId);
  });

  socket.on('sendMessage', (data) => {
    const { chatId, content, senderId } = data;
    
    const newMessage = {
      id: Date.now().toString(),
      chatId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    db.messages.push(newMessage);
    
    // Отправляем всем в чате, включая отправителя
    io.to(chatId).emit('newMessage', newMessage);
  });

  socket.on('typing', ({ chatId, userId, isTyping }) => {
    socket.to(chatId).emit('typing', { chatId, userId, isTyping });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      const user = db.users.find(u => u.id === socket.userId);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date().toISOString();
        io.emit('userStatus', { userId: user.id, isOnline: false, lastSeen: user.lastSeen });
      }
    }
    console.log('Пользователь отключился:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
