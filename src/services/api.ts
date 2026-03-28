// Wintozo API Service - РЕАЛЬНОЕ подключение к серверу!

const API_URL = 'https://wintozo-messenger.onrender.com/api/v1';

// Хранение токена
let authToken: string | null = localStorage.getItem('wintozo_token');

export const setToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('wintozo_token', token);
  } else {
    localStorage.removeItem('wintozo_token');
  }
};

export const getToken = () => authToken;

// Базовый запрос
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Ошибка сервера' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Сервер недоступен. Проверьте подключение.' };
  }
}

// ============ AUTH API ============

export interface User {
  id: string;
  odudId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  isPro: boolean;
  proUntil: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  gotPro?: boolean;
}

// Регистрация
export async function register(
  username: string,
  password: string,
  displayName: string
): Promise<{ data?: AuthResponse; error?: string }> {
  const result = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, displayName }),
  });

  if (result.data?.token) {
    setToken(result.data.token);
  }

  return result;
}

// Вход
export async function login(
  username: string,
  password: string
): Promise<{ data?: AuthResponse; error?: string }> {
  const result = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (result.data?.token) {
    setToken(result.data.token);
  }

  return result;
}

// Получить текущего пользователя
export async function getMe(): Promise<{ data?: { user: User; activeDays: number }; error?: string }> {
  return apiRequest('/auth/me');
}

// Выход
export function logout() {
  setToken(null);
}

// ============ CHATS API ============

export interface Chat {
  id: string;
  type: 'bot' | 'channel' | 'group' | 'direct';
  name: string;
  avatar: string;
  members: string[];
  isVerified?: boolean;
  isProOnly?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  createdAt: string;
}

// Получить чаты
export async function getChats(): Promise<{ data?: { chats: Chat[] }; error?: string }> {
  return apiRequest('/chats');
}

// Получить сообщения чата
export async function getChatMessages(
  chatId: string
): Promise<{ data?: { messages: Message[] }; error?: string }> {
  return apiRequest(`/chats/${chatId}/messages`);
}

// Отправить сообщение
export async function sendMessage(
  chatId: string,
  content: string,
  type: string = 'text'
): Promise<{ data?: { message: Message }; error?: string }> {
  return apiRequest(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, type }),
  });
}

// ============ PRO API ============

export interface ProStatus {
  isPro: boolean;
  activeDays: number;
  daysNeeded: number;
  proUntil: string | null;
  benefits: string[];
}

// Получить Pro статус
export async function getProStatus(): Promise<{ data?: ProStatus; error?: string }> {
  return apiRequest('/pro/status');
}

// Сменить ID (только Pro)
export async function changeId(
  newId: string
): Promise<{ data?: { success: boolean; newId: string }; error?: string }> {
  return apiRequest('/pro/change-id', {
    method: 'POST',
    body: JSON.stringify({ newId }),
  });
}

// ============ HEALTH CHECK ============

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Экспорт URL для отладки
export const getApiUrl = () => API_URL;
