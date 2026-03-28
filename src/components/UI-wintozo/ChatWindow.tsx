import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, CheckCheck, Check, Mic, Paperclip, Image, FileText } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { generateId, formatFullTime, formatSubscribers, getBotResponse } from '../../utils/helpers';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import type { Message, MessageType, FileAttachment } from '../../types';

interface ChatWindowProps {
  chatId: string;
  onBack?: () => void;
}

export default function ChatWindow({ chatId, onBack }: ChatWindowProps) {
  const { chats, messages, currentUser, inputDrafts, serverStatus } = useAppStore();
  const addMessage = useAppStore((s) => s.addMessage);
  const setDraft = useAppStore((s) => s.setDraft);
  const setTyping = useAppStore((s) => s.setTyping);
  const markAsRead = useAppStore((s) => s.markAsRead);

  const chat = chats.find((c) => c.id === chatId);
  const chatMessages = messages[chatId] ?? [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const draft = inputDrafts[chatId] ?? '';

  const isChannel = chat?.type === 'channel';
  const isReadOnly = isChannel && chat?.channelAdminId !== currentUser?.id;
  const isOffline = serverStatus !== 'online';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  useEffect(() => {
    if (chatId) markAsRead(chatId);
  }, [chatId, markAsRead]);

  const sendMessage = (text: string, messageType: MessageType = 'text', attachment?: FileAttachment) => {
    if (!currentUser || !chat) return;

    const userMsg: Message = {
      id: generateId(),
      chatId,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: Date.now(),
      status: 'sent',
      messageType,
      attachment,
    };

    addMessage(userMsg);
    setDraft(chatId, '');

    // Bot response
    if (chat.type === 'bot' && text.trim()) {
      setTyping(chatId, true);
      setTimeout(() => {
        setTyping(chatId, false);
        const botReply: Message = {
          id: generateId(),
          chatId,
          senderId: 'bot_wintozo',
          text: getBotResponse(text),
          timestamp: Date.now(),
          status: 'read',
          isBot: true,
        };
        addMessage(botReply);
      }, 1000 + Math.random() * 1500);
    }
  };

  const handleSend = () => {
    if (draft.trim()) {
      sendMessage(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: 'var(--chat)', color: 'var(--text-secondary)' }}
      >
        Чат не найден
      </div>
    );
  }

  const chatSubtitle = (() => {
    if (chat.isTyping) return null;
    if (isChannel) return formatSubscribers(chat.subscriberCount ?? 0);
    if (chat.type === 'bot') return '🤖 Умный бот · всегда онлайн';
    if (chat.type === 'group') return `${chat.participantIds.length} участников`;
    return isOffline ? 'офлайн-режим' : 'в сети';
  })();

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: 'var(--chat)' }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
      >
        {onBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--hover)' }}
          >
            <ArrowLeft size={20} style={{ color: 'var(--text)' }} />
          </motion.button>
        )}

        <Avatar
          name={chat.name}
          gradient={chat.avatarColor}
          size="md"
          isBot={chat.type === 'bot'}
          isChannel={chat.type === 'channel'}
          isVerified={chat.isVerified}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-base truncate" style={{ color: 'var(--text)' }}>
              {chat.name}
            </span>
            {chat.isVerified && <VerifiedBadge small />}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {chat.isTyping ? (
              <span className="text-green-500 animate-pulse">печатает...</span>
            ) : (
              chatSubtitle
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Channel banner */}
        {isChannel && (
          <div
            className="mb-6 rounded-2xl p-4 text-center"
            style={{ background: 'var(--bubble)' }}
          >
            <div className="text-3xl mb-2">📢</div>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>
              {chat.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {chat.description || 'Официальный канал'}
            </p>
            <div className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {formatSubscribers(chat.subscriberCount ?? 0)}
            </div>
          </div>
        )}

        {chatMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">{isChannel ? '📢' : '💬'}</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isChannel ? 'В канале пока нет сообщений' : 'Начните общение!'}
            </p>
          </div>
        )}

        {chatMessages.map((msg, idx) => {
          const isOwn = msg.senderId === currentUser?.id;
          const prevMsg = chatMessages[idx - 1];
          const showDate = !prevMsg ||
            new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'var(--hover)', color: 'var(--text-secondary)' }}
                  >
                    {new Date(msg.timestamp).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long',
                    })}
                  </span>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar
                    name={chat.name}
                    gradient={chat.avatarColor}
                    size="sm"
                    isBot={chat.type === 'bot'}
                  />
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={{
                    background: isOwn ? 'var(--bubble-own)' : 'var(--bubble)',
                    color: isOwn ? 'var(--bubble-own-text)' : 'var(--bubble-text)',
                  }}
                >
                  {/* Attachment preview */}
                  {msg.messageType && msg.messageType !== 'text' && msg.attachment && (
                    <div className="mb-2">
                      {msg.messageType === 'image' && (
                        <img
                          src={msg.attachment.url}
                          alt="image"
                          className="rounded-xl max-w-full max-h-64 object-cover"
                        />
                      )}
                      {msg.messageType === 'voice' && (
                        <div className="flex items-center gap-2 py-1">
                          <Mic size={18} />
                          <span className="text-sm">🎤 Голосовое сообщение</span>
                        </div>
                      )}
                      {msg.messageType === 'file' && (
                        <div className="flex items-center gap-2 py-1">
                          <FileText size={18} />
                          <span className="text-sm truncate">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.text && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] opacity-60">
                      {formatFullTime(msg.timestamp)}
                    </span>
                    {isOwn && (
                      <span className="opacity-60">
                        {msg.status === 'read'
                          ? <CheckCheck size={14} />
                          : <Check size={14} />
                        }
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {chat.isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 mb-2"
            >
              <Avatar
                name={chat.name}
                gradient={chat.avatarColor}
                size="sm"
                isBot={chat.type === 'bot'}
              />
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3"
                style={{ background: 'var(--bubble)' }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--text-secondary)' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isReadOnly ? (
        <div
          className="shrink-0 px-4 py-4 border-t flex items-center gap-3"
          style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
        >
          <span className="text-xl">🔒</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Канал только для чтения — писать могут только администраторы
          </span>
        </div>
      ) : (
        <div
          className="shrink-0 px-4 py-3 border-t"
          style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--hover)' }}
            >
              <Paperclip size={20} style={{ color: 'var(--text-secondary)' }} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--hover)' }}
            >
              <Image size={20} style={{ color: 'var(--text-secondary)' }} />
            </motion.button>

            <div
              className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
            >
              <input
                type="text"
                placeholder="Сообщение..."
                value={draft}
                onChange={(e) => setDraft(chatId, e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-sm min-w-0"
                style={{ color: 'var(--text)' }}
              />
            </div>

            {draft.trim() ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <Send size={18} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--hover)' }}
              >
                <Mic size={20} style={{ color: 'var(--text-secondary)' }} />
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
