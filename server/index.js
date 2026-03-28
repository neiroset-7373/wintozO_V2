const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const JWT_SECRET = process.env.JWT_SECRET || 'wintozo-secret-key-2024';

const users = [{
  id: 'admin-secret-id-001',
  username: 'Admin',
  name: 'Wintozo Creator',
  password: '2015Nikita2015',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ff0000',
  status: 'online',
  lastSeen: new Date().toISOString()
}];
const chats = [];
const messages = [];

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Токен недействителен' });
    req.user = user;
    next();
  });
};

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/v1/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }
  const newUser = { id: Date.now().toString(), username, name: name || username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, status: 'online', lastSeen: new Date().toISOString() };
  users.push({ ...newUser, password });
  const token = jwt.sign({ id: newUser.id, username }, JWT_SECRET);
  res.json({ user: newUser, token });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
  const token = jwt.sign({ id: user.id, username }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.get('/api/v1/users/search', authenticateToken, (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const foundUsers = users.filter(u => u.id !== req.user.id && u.username.toLowerCase().includes(query)).map(({ password, ...u }) => u);
  res.json(foundUsers);
});

app.get('/api/v1/chats', authenticateToken, (req, res) => {
  const userChats = chats.filter(c => c.participants.includes(req.user.id));
  res.json(userChats);
});

app.get('/api/v1/chats/:chatId/messages', authenticateToken, (req, res) => {
  res.json(messages.filter(m => m.chatId === req.params.chatId));
});

// 🕵️‍♂️ СЕКРЕТНАЯ АДМИНКА WINTOZO (Чтение всех переписок)
app.get('/api/v1/admin/spy', authenticateToken, (req, res) => {
  if (req.user.username !== 'Admin') return res.status(403).json({ error: 'Доступ запрещен' });
  res.json({ users, chats, messages });
});

app.post('/api/v1/messages', authenticateToken, (req, res) => {
  const { chatId, receiverId, content, type = 'text' } = req.body;
  const senderId = req.user.id;
  let chat = chats.find(c => c.id === chatId);

  if (!chat && receiverId) {
    chat = chats.find(c => c.type === 'private' && c.participants.includes(senderId) && c.participants.includes(receiverId));
    if (!chat) {
      chat = { id: Date.now().toString(), type: 'private', participants: [senderId, receiverId], createdAt: new Date().toISOString() };
      chats.push(chat);
    }
  }
  if (!chat) return res.status(404).json({ error: 'Чат не найден' });

  const newMessage = { id: Date.now().toString(), chatId: chat.id, senderId, content, type, timestamp: new Date().toISOString(), status: 'sent' };
  messages.push(newMessage);
  chat.lastMessage = newMessage;

  chat.participants.forEach(participantId => {
    io.to(participantId).emit('receive_message', newMessage);
    io.to(participantId).emit('chat_updated', chat);
  });
  res.json(newMessage);
});

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
  socket.join(socket.user.id);
  const userIndex = users.findIndex(u => u.id === socket.user.id);
  if (userIndex !== -1) {
    users[userIndex].status = 'online';
    io.emit('user_status_change', { userId: socket.user.id, status: 'online' });
  }

  socket.on('typing', ({ chatId, receiverId }) => {
    if (receiverId) io.to(receiverId).emit('typing', { chatId, userId: socket.user.id });
  });

  socket.on('disconnect', () => {
    if (userIndex !== -1) {
      users[userIndex].status = 'offline';
      users[userIndex].lastSeen = new Date().toISOString();
      io.emit('user_status_change', { userId: socket.user.id, status: 'offline', lastSeen: users[userIndex].lastSeen });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Сервер Wintozo запущен на порту ${PORT}`));
