import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'audio' | 'image';
}

export interface Chat {
  id: string;
  type: 'private' | 'group' | 'channel';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount?: number;
}

interface AppState {
  currentUser: User | null;
  activeChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  setCurrentUser: (user: User | null) => void;
  setActiveChat: (chat: Chat | null) => void;
  setChats: (chats: Chat[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateChat: (chat: Chat) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      activeChat: null,
      chats: [],
      messages: [],
      setCurrentUser: (user) => set({ currentUser: user }),
      setActiveChat: (chat) => set({ activeChat: chat }),
      setChats: (chats) => set({ chats }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateChat: (chat) => set((state) => ({
        chats: state.chats.map((c) => (c.id === chat.id ? chat : c)),
      })),
      logout: () => set({ currentUser: null, activeChat: null, chats: [], messages: [] }),
    }),
    {
      name: 'wintozo-storage', // 💾 Магия здесь! Все данные теперь сохраняются в браузер!
    }
  )
);
