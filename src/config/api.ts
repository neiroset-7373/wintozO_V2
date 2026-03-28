// API Configuration for Wintozo Messenger
// Укажите URL вашего сервера здесь

// ====== НАСТРОЙКА СЕРВЕРА ======
// Render (бесплатно, засыпает через 15 мин):
const SERVER_URL = 'https://wintozo-messenger.onrender.com';

// Railway (бесплатно, НЕ засыпает) - раскомментируйте если используете:
// const SERVER_URL = 'https://wintozo-production.up.railway.app';

// Локальный сервер для разработки:
// const SERVER_URL = 'http://localhost:3001';

export const API_CONFIG = {
  // Backend API URL (REST)
  BASE_URL: import.meta.env.VITE_API_URL || SERVER_URL,
  
  // WebSocket URL для реального времени
  WS_URL: import.meta.env.VITE_WS_URL || SERVER_URL.replace('http', 'ws'),
  
  // Endpoints - ТОЧНЫЕ эндпоинты из вашего server/index.js
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    ME: '/api/v1/auth/me',
    
    // Health check
    HEALTH: '/api/v1/health',
    
    // Chats
    CHATS: '/api/v1/chats',
    CHAT_MESSAGES: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
    SEND_MESSAGE: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
    
    // Pro
    PRO_STATUS: '/api/v1/pro/status',
    CHANGE_ID: '/api/v1/pro/change-id',
  },
  
  // Timeouts
  TIMEOUT: 15000,
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 10,
};

// Helper для создания полного URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper для WebSocket URL
export const getWsUrl = (): string => {
  return API_CONFIG.WS_URL;
};
