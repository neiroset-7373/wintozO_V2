import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../config/api';

let socket: Socket | null = null;

export const initWebSocket = (token: string) => {
  if (socket) socket.disconnect();
  
  // Мы используем SERVER_URL и разрешаем polling для обхода блокировок Render
  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket', 'polling'], 
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const getSocket = () => socket;
