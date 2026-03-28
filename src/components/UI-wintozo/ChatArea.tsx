import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Smile, Mic, Square, Phone, Video, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../services/api';
import { SERVER_URL } from '../../config/api';

export const ChatArea: React.FC = () => {
  const { activeChat, currentUser, messages, addMessage } = useAppStore();
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // 🕵️‍♂️ Состояния для Админки
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  if (!activeChat || !currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
          <Send className="w-10 h-10 text-indigo-500 opacity-50 ml-2" />
        </div>
        <p className="text-gray-500 font-medium">Выберите чат для начала общения</p>
      </div>
    );
  }

  // 🕵️‍♂️ Загрузка секретных данных
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${SERVER_URL}/api/v1/admin/spy`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setAdminData(await res.json());
        setShowAdminPanel(true);
      } else {
        alert('❌ Доступ запрещен!');
      }
    } catch (e) { alert('Ошибка сервера'); }
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;

    // 🕵️‍♂️ СЕКРЕТНАЯ КОМАНДА
    if (text === '/adminsystem') {
      if (currentUser.username === 'Admin') {
        fetchAdminData();
      } else {
        alert('❌ У вас нет прав администратора!');
      }
      setNewMessage('');
      return;
    }

    try {
      const receiverId = activeChat.type === 'private' ? activeChat.participants.find(p => p !== currentUser.id) : undefined;
      const msg = await api.sendMessage(activeChat.id, receiverId, text, 'text');
      addMessage(msg);
      setNewMessage('');
    } catch (error) { console.error('Ошибка отправки:', error); }
  };

  const chatName = activeChat.type === 'private' ? activeChat.participants.find(p => p !== currentUser.id) || 'User' : activeChat.name;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f5f7fb] dark:bg-gray-900 relative">
      
      {/* 🕵️‍♂️ ХАКЕРСКАЯ ПАНЕЛЬ АДМИНА */}
      {showAdminPanel && adminData && (
        <div className="absolute inset-0 z-50 bg-black/95 text-green-500 p-8 overflow-y-auto font-mono text-sm border-4 border-green-500 rounded-lg shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-green-500 pb-4">
            <h2 className="text-2xl font-bold flex items-center"><ShieldAlert className="w-8 h-8 mr-3 text-red-500 animate-pulse"/> ПАНЕЛЬ БОГА: WINTOZO ADMIN</h2>
            <button onClick={() => setShowAdminPanel(false)} className="text-red-500 font-bold text-2xl hover:text-white transition-colors">✖</button>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-black border border-green-800 p-4 rounded">
              <h3 className="text-white text-lg mb-4 border-b border-gray-700 pb-2">👥 БАЗА ПОЛЬЗОВАТЕЛЕЙ:</h3>
              {adminData.users.map((u: any) => (
                <div key={u.id} className="mb-2">
                  <span className="text-blue-400">@{u.username}</span> | 
                  <span className="text-gray-400 text-xs ml-2">Пароль: {u.password}</span> | 
                  <span className={u.status === 'online' ? 'text-green-500 ml-2' : 'text-gray-500 ml-2'}>[{u.status}]</span>
                </div>
              ))}
            </div>
            
            <div className="bg-black border border-green-800 p-4 rounded">
              <h3 className="text-white text-lg mb-4 border-b border-gray-700 pb-2">💬 ПЕРЕХВАТ СООБЩЕНИЙ:</h3>
              {adminData.messages.length === 0 ? <p className="text-gray-500">Сообщений пока нет...</p> : null}
              {adminData.messages.map((m: any) => {
                const sender = adminData.users.find((u:any) => u.id === m.senderId)?.username || 'Unknown';
                return (
                  <div key={m.id} className="mb-3 border-l-2 border-green-800 pl-3">
                    <div className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleString()}</div>
                    <div className="text-yellow-400 font-bold">{sender}:</div>
                    <div className="text-white break-words">{m.type === 'audio' ? '🎤 [Голосовое сообщение]' : m.content}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Шапка */}
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">{chatName.charAt(0).toUpperCase()}</div>
          <div><h2 className="font-semibold text-gray-800 dark:text-white">{chatName}</h2></div>
        </div>
        <div className="flex items-center space-x-4 text-indigo-500">
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />
          <MoreVertical className="w-5 h-5 cursor-pointer text-gray-400" />
        </div>
      </div>

      {/* Чат */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.filter(m => m.chatId === activeChat.id).map((m) => {
          const isOwn = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isOwn ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800'}`}>
                {(m as any).type === 'audio' ? <audio src={m.content} controls className="h-10 w-[200px]" /> : <p>{m.content}</p>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendText} className="flex items-center space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 bg-gray-50 rounded-full flex items-center px-4 py-2 border border-gray-200">
            <Smile className="w-5 h-5 text-gray-400 mr-3" />
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Написать сообщение или /adminsystem..." className="flex-1 bg-transparent outline-none" />
          </div>
          <button type="submit" className="p-3 bg-indigo-500 text-white rounded-full"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </div>
  );
};
