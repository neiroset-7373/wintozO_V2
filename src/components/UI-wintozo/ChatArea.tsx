import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Smile, Mic, Square, Phone, Video } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../services/api';

export const ChatArea: React.FC = () => {
  const { activeChat, currentUser, messages, addMessage } = useAppStore();
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!activeChat || !currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Send className="w-10 h-10 text-indigo-500 opacity-50 ml-2" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Выберите чат для начала общения</p>
      </div>
    );
  }

  const isGroup = activeChat.type === 'group' || activeChat.type === 'channel';
  const chatName = isGroup ? activeChat.name : activeChat.participants.find(p => p !== currentUser.id) || 'User';
  const receiverId = isGroup ? undefined : activeChat.participants.find(p => p !== currentUser.id);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const msg = await api.sendMessage(activeChat.id, receiverId, newMessage.trim(), 'text');
      addMessage(msg);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const msg = await api.sendMessage(activeChat.id, receiverId, base64Audio, 'audio');
            addMessage(msg);
          } catch (error) {
            console.error('Ошибка отправки аудио:', error);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка микрофона:', err);
      alert('Разрешите доступ к микрофону!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatMessageTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAudioCall = () => alert("📞 Звонок начат! (Интерфейс в разработке)");
  const handleVideoCall = () => alert("📹 Видеозвонок начат! (Интерфейс в разработке)");

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f5f7fb] dark:bg-gray-900">
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            {chatName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">{chatName}</h2>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">Онлайн</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400 dark:text-gray-400">
          <button onClick={handleAudioCall} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-indigo-500">
            <Phone className="w-5 h-5" />
          </button>
          <button onClick={handleVideoCall} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-indigo-500">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.filter(m => m.chatId === activeChat.id).map((message) => {
          const isOwn = message.senderId === currentUser.id;
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] sm:max-w-[60%] rounded-2xl px-5 py-3 shadow-sm ${
                isOwn ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-gray-700'
              }`}>
                {(message as any).type === 'audio' ? (
                  <div className="flex items-center space-x-2">
                    <audio src={message.content} controls className="h-10 w-[200px] sm:w-[250px] outline-none" />
                  </div>
                ) : (
                  <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                )}
                <div className={`text-[11px] mt-1.5 flex items-center justify-end space-x-1 ${
                  isOwn ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  <span>{formatMessageTime(message.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50">
        <form onSubmit={handleSendText} className="flex items-center space-x-3 max-w-4xl mx-auto">
          <button type="button" className="p-2.5 text-gray-400 hover:text-indigo-500 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all">
            <button type="button" className="text-gray-400 hover:text-amber-500 transition-colors mr-3">
              <Smile className="w-5 h-5" />
            </button>
            
            {isRecording ? (
              <div className="flex-1 flex items-center text-red-500 animate-pulse">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></span>
                <span className="font-medium">Запись аудио... {formatTime(recordingTime)}</span>
              </div>
            ) : (
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Написать сообщение..."
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
            )}
          </div>

          {newMessage.trim() ? (
            <button type="submit" className="p-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : isRecording ? (
            <button type="button" onClick={stopRecording} className="p-3.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
              <Square className="w-5 h-5" fill="currentColor" />
            </button>
          ) : (
            <button type="button" onClick={startRecording} className="p-3.5 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-500 rounded-full transition-transform hover:scale-105 active:scale-95">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
