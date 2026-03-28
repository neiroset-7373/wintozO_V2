export type DeviceMode = 'phone' | 'desktop';
export type ThemeName = 'light' | 'dark' | 'amoled' | 'pink' | 'forest' | 'ocean';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  emoji: string;
  bg: string;
  sidebar: string;
  chat: string;
  accent: string;
  accentGradient: string;
  text: string;
  textSecondary: string;
  bubble: string;
  bubbleOwn: string;
  bubbleOwnText: string;
  bubbleText: string;
  inputBg: string;
  border: string;
  hover: string;
  neon: boolean;
}

export interface Friend {
  id: string;
  userId: string;
  username: string;
  login: string;
  displayName: string;
  avatarColor: string;
  chatId: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video_file';

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  url: string;
  duration?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  isBot?: boolean;
  messageType?: MessageType;
  attachment?: FileAttachment;
}

export interface Chat {
  id: string;
  type: 'direct' | 'bot' | 'group' | 'channel';
  name: string;
  avatarColor: string;
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  participantIds: string[];
  isVerified?: boolean;
  channelAdminId?: string;
  description?: string;
  subscriberCount?: number;
}

export interface GroupMember {
  id: string;
  displayName: string;
  avatarColor: string;
  role: 'admin' | 'member';
}

export interface AppState {
  deviceMode: DeviceMode | null;
  theme: ThemeName;
  currentUser: User | null;
  isAuthenticated: boolean;
  chats: Chat[];
  messages: Record<string, Message[]>;
  friends: Friend[];
  activeScreen: 'splash' | 'device-select' | 'onboarding' | 'auth' | 'app';
  inputDrafts: Record<string, string>;
  serverStatus: 'online' | 'offline' | 'checking';
  adminPanelOpen: boolean;
}

export interface BotResponse {
  triggers: string[];
  responses: string[];
}

export interface CallState {
  active: boolean;
  type: 'audio' | 'video';
  chatId: string;
  status: 'calling' | 'connected' | 'ended';
  duration: number;
}

export interface ProSubscription {
  active: boolean;
  expiresAt: number | null;
  activatedAt: number | null;
  daysActive: number;
  messagesWrittenToAdmin: number;
  customId: string | null;
}

export interface User {
  id: string;
  odudId?: string;  // ID от сервера
  userId: string;
  username: string;
  login: string;
  displayName: string;
  avatarColor: string;
  avatar?: string | null;
  createdAt: number;
  token?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  isPro?: boolean;
  proUntil?: string | null;
  proSubscription?: ProSubscription;
}
