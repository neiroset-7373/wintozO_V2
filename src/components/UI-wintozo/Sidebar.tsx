import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Settings, UserPlus, LogOut, X, Check,
  Users, MessageCircle, Hash, Copy, CheckCheck, AtSign,
  Cloud, CloudOff, Wifi, WifiOff,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Chat, ThemeName } from '../../types';
import { formatTime, generateId, generateAvatarGradient } from '../../utils/helpers';
import { themeList } from '../../data/themes';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import { useServerConnection } from '../../hooks/useServerConnection';

interface SidebarProps {
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}

type SidebarTab = 'chats' | 'friends' | 'profile';

export default function Sidebar({ activeChatId, onSelectChat }: SidebarProps) {
  const { chats, currentUser, theme, friends } = useAppStore();
  const setTheme = useAppStore((s) => s.setTheme);
  const addFriend = useAppStore((s) => s.addFriend);
  const addChat = useAppStore((s) => s.addChat);
  const logout = useAppStore((s) => s.logout);
  const { status: serverStatus, isOnline } = useServerConnection();

  const [tab, setTab] = useState<SidebarTab>('chats');
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [friendUsername, setFriendUsername] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState(false);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser?.userId ?? '').catch(() => undefined);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(`@${currentUser?.username ?? ''}`).catch(() => undefined);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFriends = friends.filter((f) => {
    const q = search.toLowerCase().replace('@', '');
    return (
      f.username?.toLowerCase().includes(q) ||
      f.displayName.toLowerCase().includes(q)
    );
  });

  const handleAddFriend = () => {
    setFriendError('');
    const usernameClean = friendUsername.trim().toLowerCase().replace(/^@/, '');
    const nameClean = friendName.trim();

    if (usernameClean.length < 3) {
      setFriendError('Юзернейм минимум 3 символа (например: @ivan)');
      return;
    }
    if (nameClean.length < 2) {
      setFriendError('Введите имя пользователя');
      return;
    }
    if (usernameClean === (currentUser?.username ?? '')) {
      setFriendError('Нельзя добавить самого себя');
      return;
    }
    if (friends.find((f) => f.username === usernameClean)) {
      setFriendError('Этот пользователь уже в списке друзей');
      return;
    }

    const chatId = `direct_${usernameClean}`;
    const avatarColor = generateAvatarGradient(usernameClean);
    const friendId = generateId();

    addFriend({
      id: friendId,
      userId: String(Math.floor(Math.random() * 999999)).padStart(6, '0'),
      username: usernameClean,
      login: usernameClean,
      displayName: nameClean,
      avatarColor,
      chatId,
    });

    addChat({
      id: chatId,
      type: 'direct',
      name: nameClean,
      avatarColor,
      unreadCount: 0,
      participantIds: [currentUser?.id ?? '', friendId],
    });

    setFriendSuccess(true);
    setTimeout(() => {
      setShowAddFriend(false);
      setFriendUsername('');
      setFriendName('');
      setFriendSuccess(false);
      onSelectChat(chatId);
      setTab('chats');
    }, 1200);
  };

  const renderChatItem = (chat: Chat) => {
    const isActive = activeChatId === chat.id;
    const lastMsg = chat.lastMessage;
    const isChannel = chat.type === 'channel';

    return (
      <motion.div
        key={chat.id}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectChat(chat.id)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all"
        style={{
          background: isActive ? 'var(--accent)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        <div className="relative shrink-0">
          <Avatar
            name={chat.name}
            gradient={chat.avatarColor}
            size="md"
            isBot={chat.type === 'bot'}
            isOnline={false}
          />
          {isChannel && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <Hash size={9} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <span
                className="font-semibold text-sm truncate"
                style={{ color: isActive ? '#fff' : 'var(--text)' }}
              >
                {chat.name}
              </span>
              {chat.isVerified && <VerifiedBadge small />}
            </div>
            <span
              className="text-xs shrink-0"
              style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}
            >
              {lastMsg ? formatTime(lastMsg.timestamp) : ''}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <span
              className="text-xs truncate"
              style={{ color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}
            >
              {chat.isTyping
                ? '⌨️ печатает...'
                : lastMsg?.text
                  ? lastMsg.text.slice(0, 38) + (lastMsg.text.length > 38 ? '…' : '')
                  : isChannel ? '📢 Канал' : 'Нет сообщений'}
            </span>
            {(chat.unreadCount ?? 0) > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--accent)',
                  color: isActive ? '#fff' : '#fff',
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div
        className="flex flex-col h-full w-80"
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <svg width="20" height="20" viewBox="0 0 60 60" fill="none">
                  <path d="M10 20C10 20 20 10 30 10C40 10 50 20 50 30C50 40 40 50 30 50C20 50 12 44 10 36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M10 36L6 48L18 44" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="22" cy="30" r="3" fill="white" />
                  <circle cx="30" cy="30" r="3" fill="white" />
                  <circle cx="38" cy="30" r="3" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                Wintozo
              </span>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddFriend(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'var(--hover)' }}
              >
                <UserPlus size={18} style={{ color: 'var(--text-secondary)' }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'var(--hover)' }}
              >
                <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--hover)' }}
          >
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 mb-2">
          {[
            { key: 'chats' as SidebarTab, icon: MessageCircle, label: 'Чаты' },
            { key: 'friends' as SidebarTab, icon: Users, label: 'Друзья' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === key ? 'var(--accent)' : 'var(--hover)',
                color: tab === key ? 'white' : 'var(--text-secondary)',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {tab === 'chats' && (
            <div className="space-y-1">
              {filteredChats.map(renderChatItem)}
              {filteredChats.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Чаты не найдены
                </div>
              )}
            </div>
          )}

          {tab === 'friends' && (
            <div className="space-y-1">
              {filteredFriends.map((friend) => (
                <motion.div
                  key={friend.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectChat(friend.chatId);
                    setTab('chats');
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <Avatar name={friend.displayName} gradient={friend.avatarColor} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                      {friend.displayName}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      @{friend.username}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredFriends.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {friends.length === 0 ? 'Добавьте друзей' : 'Друзья не найдены'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User info */}
        <div
          className="shrink-0 px-3 py-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <Avatar
              name={currentUser?.displayName ?? 'User'}
              gradient={currentUser?.avatarColor ?? 'from-blue-500 to-purple-500'}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                {currentUser?.displayName ?? 'User'}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                @{currentUser?.username ?? 'user'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background: 'var(--sidebar)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  ⚙️ Настройки
                </h3>
                <button onClick={() => setShowSettings(false)}>
                  <X size={22} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {/* Profile */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  👤 Профиль
                </h4>
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{ background: 'var(--hover)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>ID</span>
                    <button
                      onClick={handleCopyId}
                      className="flex items-center gap-1 text-sm font-mono"
                      style={{ color: 'var(--accent)' }}
                    >
                      {currentUser?.userId}
                      {copiedId ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Username</span>
                    <button
                      onClick={handleCopyUsername}
                      className="flex items-center gap-1 text-sm"
                      style={{ color: 'var(--accent)' }}
                    >
                      <AtSign size={14} />
                      {currentUser?.username}
                      {copiedUsername ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  🎨 Тема
                </h4>
                <div className="flex flex-wrap gap-2">
                  {themeList.map((t) => (
                    <motion.button
                      key={t.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTheme(t.name as ThemeName)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        theme === t.name ? 'ring-2 ring-offset-1' : ''
                      }`}
                      style={{
                        background: theme === t.name ? 'var(--accent)' : 'var(--hover)',
                        color: theme === t.name ? 'white' : 'var(--text)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {t.emoji} {t.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Server Status */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                  🌐 Сервер
                </h4>
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{ background: 'var(--hover)' }}
                >
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Cloud size={16} className="text-green-400" />
                    ) : (
                      <CloudOff size={16} className="text-red-400" />
                    )}
                    <span className="text-sm" style={{ color: 'var(--text)' }}>
                      API: {serverStatus.api === 'checking' ? 'Проверка...' : isOnline ? 'Онлайн' : 'Офлайн'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {serverStatus.ws === 'connected' ? (
                      <Wifi size={16} className="text-green-400" />
                    ) : (
                      <WifiOff size={16} className="text-yellow-400" />
                    )}
                    <span className="text-sm" style={{ color: 'var(--text)' }}>
                      WebSocket: {serverStatus.ws === 'connected' ? 'Подключено' : 'Отключено'}
                    </span>
                  </div>
                  {!isOnline && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs text-yellow-400">
                        ⚠️ Работа в оффлайн режиме
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  logout();
                  setShowSettings(false);
                }}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-500 font-medium"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <LogOut size={18} />
                Выйти
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Friend Modal */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowAddFriend(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background: 'var(--sidebar)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  👤 Добавить друга
                </h3>
                <button onClick={() => setShowAddFriend(false)}>
                  <X size={22} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {friendSuccess ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}
                  >
                    <CheckCheck size={32} color="white" />
                  </motion.div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>
                    Друг добавлен!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                      Юзернейм
                    </label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={friendUsername}
                      onChange={(e) => setFriendUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                      style={{
                        background: 'var(--input-bg)',
                        color: 'var(--text)',
                        borderColor: 'var(--border)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                      Имя
                    </label>
                    <input
                      type="text"
                      placeholder="Как зовут друга?"
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                      style={{
                        background: 'var(--input-bg)',
                        color: 'var(--text)',
                        borderColor: 'var(--border)',
                      }}
                    />
                  </div>

                  {friendError && (
                    <p className="text-red-500 text-sm">{friendError}</p>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddFriend}
                    className="w-full py-3 rounded-xl font-bold text-white"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    ✨ Добавить
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
