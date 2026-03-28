import { create } from 'zustand';
import type { Message, Chat, User, Friend, ThemeName, DeviceMode } from '../types';

const PRO_DURATION_DAYS = 14;
const DAYS_TO_UNLOCK_PRO = 7;

export const ADMIN_USER_ID = 'admin_wintozo_official';

export const adminUser: User = {
  id: ADMIN_USER_ID,
  userId: '111111111',
  username: 'admin_wintozo',
  login: 'admin',
  displayName: 'Admin',
  avatarColor: 'from-blue-500 to-cyan-400',
  createdAt: 1700000000000,
  isVerified: true,
  isAdmin: true,
};

export const ADMIN_LOGIN = 'admin';
export const ADMIN_PASSWORD = '2015Nikita2015';
export const CHANNEL_ID = 'channel_wintozo_official';

const defaultChats: Chat[] = [
  {
    id: CHANNEL_ID,
    type: 'channel',
    name: 'Wintozo Official',
    avatarColor: 'from-blue-500 to-violet-600',
    unreadCount: 1,
    participantIds: [ADMIN_USER_ID],
    isVerified: true,
    channelAdminId: ADMIN_USER_ID,
    description: '📢 Официальный канал мессенджера Wintozo. Новости, обновления и анонсы.',
    subscriberCount: 12847,
  },
  {
    id: 'bot_wintozo',
    type: 'bot',
    name: 'Wintozo Bot',
    avatarColor: 'from-violet-500 to-indigo-600',
    unreadCount: 1,
    participantIds: ['bot_wintozo'],
    isVerified: true,
  },
];

const defaultMessages: Record<string, Message[]> = {
  [CHANNEL_ID]: [
    {
      id: 'ch_msg_1',
      chatId: CHANNEL_ID,
      senderId: ADMIN_USER_ID,
      text: '🎉 Добро пожаловать в официальный канал Wintozo!\n\nЗдесь мы публикуем:\n• 🚀 Новости и обновления\n• 🛠 Патчи и исправления\n• 📣 Важные объявления\n\nПодпишитесь, чтобы не пропустить ничего важного!',
      timestamp: Date.now() - 3600000 * 24,
      status: 'read',
    },
    {
      id: 'ch_msg_2',
      chatId: CHANNEL_ID,
      senderId: ADMIN_USER_ID,
      text: '🔥 Версия 1.0.0 — РЕЛИЗ!\n\n✅ Голосовые сообщения\n✅ Отправка файлов и фото\n✅ Создание групп\n✅ 6 тем оформления\n✅ Умный Wintozo Bot\n✅ Звонки (онлайн-режим)\n\nСпасибо всем, кто с нами с первого дня! ❤️',
      timestamp: Date.now() - 3600000 * 2,
      status: 'read',
    },
  ],
  bot_wintozo: [
    {
      id: 'welcome_1',
      chatId: 'bot_wintozo',
      senderId: 'bot_wintozo',
      text: '👋 Привет! Я Wintozo Bot — твой умный помощник!\n\nНапиши /help чтобы узнать, что я умею, или просто пообщайся со мной 😊',
      timestamp: Date.now() - 60000,
      status: 'read',
      isBot: true,
    },
  ],
};

interface AppState {
  deviceMode: DeviceMode | null;
  deviceType: 'phone' | 'desktop' | null;
  theme: ThemeName;
  hasSeenOnboarding: boolean;
  currentUser: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  chats: Chat[];
  messages: Record<string, Message[]>;
  friends: Friend[];
  inputDrafts: Record<string, string>;
  serverStatus: 'online' | 'offline' | 'checking';
  adminPanelOpen: boolean;
}

interface AppStore extends AppState {
  setDeviceMode: (mode: DeviceMode) => void;
  setDeviceType: (type: 'phone' | 'desktop') => void;
  setTheme: (theme: ThemeName) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  addMessage: (message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addFriend: (friend: Friend) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  setDraft: (chatId: string, text: string) => void;
  setServerStatus: (status: AppState['serverStatus']) => void;
  setAdminPanel: (open: boolean) => void;
  markAsRead: (chatId: string) => void;
  recordActivity: () => void;
  checkAndActivatePro: () => boolean;
  changeUserId: (newId: string) => boolean;
  getProStatus: () => { daysActive: number; daysRemaining: number; canWriteToAdmin: number; isEligible: boolean };
  incrementAdminMessages: () => void;
  ensureDefaultChats: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  deviceMode: null,
  deviceType: null,
  theme: 'dark',
  hasSeenOnboarding: false,
  currentUser: null,
  isAuthenticated: false,
  authToken: null,
  chats: defaultChats,
  messages: defaultMessages,
  friends: [],
  inputDrafts: {},
  serverStatus: 'online',
  adminPanelOpen: false,

  setDeviceMode: (mode) => set({ deviceMode: mode }),
  setDeviceType: (type) => set({ deviceType: type }),
  setTheme: (theme) => set({ theme }),
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  setAuthToken: (token) => set({ authToken: token }),
  
  login: (user, token) => set({ 
    currentUser: user, 
    authToken: token, 
    isAuthenticated: true 
  }),
  
  logout: () => set({
    currentUser: null,
    authToken: null,
    isAuthenticated: false,
    chats: defaultChats,
    messages: defaultMessages,
    friends: [],
  }),

  setChats: (chats) => set({ chats }),
  
  addChat: (chat) => {
    const { chats, messages } = get();
    if (chats.find((c) => c.id === chat.id)) return;
    set({
      chats: [chat, ...chats],
      messages: { ...messages, [chat.id]: [] },
    });
  },
  
  updateChat: (chatId, updates) => {
    const { chats } = get();
    set({
      chats: chats.map((c) => (c.id === chatId ? { ...c, ...updates } : c)),
    });
  },
  
  addMessage: (message) => {
    const { messages, chats } = get();
    const chatMessages = messages[message.chatId] ?? [];
    set({
      messages: {
        ...messages,
        [message.chatId]: [...chatMessages, message],
      },
      chats: chats.map((c) =>
        c.id === message.chatId ? { ...c, lastMessage: message } : c
      ),
    });
  },
  
  setMessages: (chatId, msgs) => {
    const { messages } = get();
    set({ messages: { ...messages, [chatId]: msgs } });
  },
  
  addFriend: (friend) => {
    const { friends } = get();
    if (friends.find((f) => f.id === friend.id)) return;
    set({ friends: [...friends, friend] });
  },

  setTyping: (chatId, isTyping) => {
    const { chats } = get();
    set({
      chats: chats.map((c) => (c.id === chatId ? { ...c, isTyping } : c)),
    });
  },
  
  setDraft: (chatId, text) => {
    const { inputDrafts } = get();
    set({ inputDrafts: { ...inputDrafts, [chatId]: text } });
  },
  
  setServerStatus: (status) => set({ serverStatus: status }),
  setAdminPanel: (open) => set({ adminPanelOpen: open }),
  
  markAsRead: (chatId) => {
    const { chats, messages } = get();
    set({
      chats: chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
      messages: {
        ...messages,
        [chatId]: (messages[chatId] ?? []).map((m) => ({
          ...m,
          status: 'read' as const,
        })),
      },
    });
  },

  recordActivity: () => {},
  
  checkAndActivatePro: () => {
    const { currentUser } = get();
    if (!currentUser || currentUser.isPro) return false;
    
    const daysActive = 7;
    if (daysActive >= DAYS_TO_UNLOCK_PRO) {
      const now = Date.now();
      const expiresAt = now + PRO_DURATION_DAYS * 24 * 60 * 60 * 1000;
      set({
        currentUser: {
          ...currentUser,
          isPro: true,
          proSubscription: {
            active: true,
            activatedAt: now,
            expiresAt,
            daysActive,
            messagesWrittenToAdmin: 0,
            customId: null,
          },
        },
      });
      return true;
    }
    return false;
  },
  
  changeUserId: (newId: string) => {
    const { currentUser } = get();
    if (!currentUser?.isPro || !currentUser.proSubscription?.active) return false;
    if (currentUser.proSubscription.customId !== null) return false;
    
    set({
      currentUser: {
        ...currentUser,
        userId: newId,
        proSubscription: {
          ...currentUser.proSubscription,
          customId: newId,
        },
      },
    });
    return true;
  },
  
  getProStatus: () => {
    const { currentUser } = get();
    const daysActive = 0;
    
    if (currentUser?.isPro && currentUser.proSubscription) {
      const now = Date.now();
      const daysRemaining = currentUser.proSubscription.expiresAt
        ? Math.max(0, Math.ceil((currentUser.proSubscription.expiresAt - now) / (24 * 60 * 60 * 1000)))
        : 0;
      const canWriteToAdmin = Math.max(0, 2 - (currentUser.proSubscription.messagesWrittenToAdmin || 0));
      return {
        daysActive: currentUser.proSubscription.daysActive || daysActive,
        daysRemaining,
        canWriteToAdmin,
        isEligible: true,
      };
    }
    return {
      daysActive,
      daysRemaining: 0,
      canWriteToAdmin: 0,
      isEligible: daysActive >= DAYS_TO_UNLOCK_PRO,
    };
  },
  
  incrementAdminMessages: () => {
    const { currentUser } = get();
    if (!currentUser?.isPro || !currentUser.proSubscription) return;
    
    set({
      currentUser: {
        ...currentUser,
        proSubscription: {
          ...currentUser.proSubscription,
          messagesWrittenToAdmin: (currentUser.proSubscription.messagesWrittenToAdmin || 0) + 1,
        },
      },
    });
  },
  
  ensureDefaultChats: () => {
    const { chats, messages } = get();
    let updatedChats = [...chats];
    let updatedMessages = { ...messages };
    let changed = false;
    
    for (const dc of defaultChats) {
      if (!updatedChats.find((c) => c.id === dc.id)) {
        updatedChats = [dc, ...updatedChats];
        if (!updatedMessages[dc.id]) {
          updatedMessages[dc.id] = defaultMessages[dc.id] ?? [];
        }
        changed = true;
      }
    }
    
    if (changed) {
      set({ chats: updatedChats, messages: updatedMessages });
    }
  },
}));
