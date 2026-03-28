import { SERVER_URL } from '../config/api';
import { User, Chat, Message } from '../store/appStore';

export const api = {
  // Авторизация: Вход
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${SERVER_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store' // Отключаем кэш, чтобы всегда получать свежий ответ от сервера
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }
    const data = await response.json();
    localStorage.setItem('token', data.token); // Сохраняем токен в браузере
    return data;
  },

  // Авторизация: Регистрация
  register: async (username: string, password: string, name?: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${SERVER_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
      cache: 'no-store'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  // Выход из аккаунта
  logout: () => {
    localStorage.removeItem('token');
  },

  // Поиск пользователей (по логину)
  searchUsers: async (query: string): Promise<User[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Нет токена авторизации');
    
    const response = await fetch(`${SERVER_URL}/api/v1/users/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Ошибка поиска пользователей');
    return response.json();
  },

  // Получение списка чатов пользователя
  getChats: async (): Promise<Chat[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Нет токена авторизации');
    
    const response = await fetch(`${SERVER_URL}/api/v1/chats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Ошибка получения чатов');
    return response.json();
  },

  // Получение истории сообщений конкретного чата
  getMessages: async (chatId: string): Promise<Message[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Нет токена авторизации');
    
    const response = await fetch(`${SERVER_URL}/api/v1/chats/${chatId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Ошибка получения сообщений');
    return response.json();
  },

  // Отправка сообщения (Текст, Аудио или Картинка)
  sendMessage: async (
    chatId: string, 
    receiverId: string | undefined, 
    content: string, 
    type: 'text' | 'audio' | 'image' = 'text'
  ): Promise<Message> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Нет токена авторизации');
    
    const response = await fetch(`${SERVER_URL}/api/v1/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Теперь мы передаем параметр type на сервер!
      body: JSON.stringify({ chatId, receiverId, content, type }),
    });
    
    if (!response.ok) throw new Error('Ошибка отправки сообщения');
    return response.json();
  },

  // Проверка статуса сервера (онлайн/оффлайн)
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/health`, { cache: 'no-store' });
      return response.ok;
    } catch {
      return false;
    }
  }
};
