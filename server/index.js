const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*' })); // Разрешаем запросы с Vercel
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const JWT_SECRET = process.env.JWT_SECRET || 'wintozo-secret-key-2024';

// Простая база данных (в оперативной памяти)
const users = [];
const chats = [];
const messages = [];

// Проверка токена
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Токен недействителен' });
    req.user = user;
    next();
  });
};

// --- REST API ---

// 1. Здоровье сервера
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Регистрация
app.post('/api/v1/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    name: name || username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    status: 'online',
    lastSeen: new Date().toISOString()
  };
  
  users.push({ ...newUser, password }); // сохраняем с паролем
  
  const token = jwt.sign({ id: newUser.id, username }, JWT_SECRET);
  res.json({ user: newUser, token });
});

// 3. Логин
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
  
  const token = jwt.sign({ id: user.id, username }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

// 4. Поиск пользователей (для добавления в друзья)
app.get('/api/v1/users/search', authenticateToken, (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const foundUsers = users
    .filter(u => u.id !== req.user.id && (u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)))
    .map(({ password, ...u }) => u);
  res.json(foundUsers);
});

// 5. Получение чатов
app.get('/api/v1/chats', authenticateToken, (req, res) => {
  const userChats = chats.filter(c => c.participants.includes(req.user.id));
  res.json(userChats);
});

// 6. Получение сообщений чата
app.get('/api/v1/chats/:chatId/messages', authenticateToken, (req, res) => {
  const chatMessages = messages.filter(m => m.chatId === req.params.chatId);
  res.json(chatMessages);
});

// 7. ОТПРАВКА СООБЩЕНИЯ (САМОЕ ВАЖНОЕ)
app.post('/api/v1/messages', authenticateToken, (req, res) => {
  const { chatId, receiverId, content } = req.body;
  const senderId = req.user.id;

  let chat = chats.find(c => c.id === chatId);

  // Если чата еще нет (первое сообщение), создаем его
  if (!chat && receiverId) {
    chat = chats.find(c => c.type === 'private' && c.participants.includes(senderId) && c.participants.includes(receiverId));
    if (!chat) {
      chat = {
        id: Date.now().toString(),
        type: 'private',
        participants: [senderId, receiverId],
        createdAt: new Date().toISOString(),
      };
      chats.push(chat);
    }
  }

  if (!chat) return res.status(404).json({ error: 'Чат не найден' });

  const newMessage = {
    id: Date.now().toString(),
    chatId: chat.id,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };

  messages.push(newMessage);
  chat.lastMessage = newMessage;

  // МАГИЯ РЕАЛЬНОГО ВРЕМЕНИ:
  // Отправляем сообщение напрямую ВСЕМ участникам чата по их личным ID комнатам!
  chat.participants.forEach(participantId => {
    io.to(participantId).emit('receive_message', newMessage);
    io.to(participantId).emit('chat_updated', chat); // Заставляем их меню обновиться
  });

  res.json(newMessage);
});

// --- WEBSOCKETS (Реальное время) ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Нет токена'));
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Неверный токен'));
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`Пользователь подключился: ${socket.user.username}`);
  
  // КРИТИЧЕСКИ ВАЖНО: Пользователь заходит в свою ЛИЧНУЮ комнату
  socket.join(socket.user.id);
  
  // Делаем его онлайн
  const userIndex = users.findIndex(u => u.id === socket.user.id);
  if (userIndex !== -1) {
    users[userIndex].status = 'online';
    io.emit('user_status_change', { userId: socket.user.id, status: 'online' });
  }

  socket.on('typing', ({ chatId, receiverId }) => {
    if (receiverId) io.to(receiverId).emit('typing', { chatId, userId: socket.user.id });
  });

  socket.on('disconnect', () => {
    console.log(`Пользователь отключился: ${socket.user.username}`);
    if (userIndex !== -1) {
      users[userIndex].status = 'offline';
      users[userIndex].lastSeen = new Date().toISOString();
      io.emit('user_status_change', { userId: socket.user.id, status: 'offline', lastSeen: users[userIndex].lastSeen });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер Wintozo запущен на порту ${PORT}`);
});
