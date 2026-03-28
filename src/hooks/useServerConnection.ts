// Hook для управления подключением к серверу
import { useEffect, useState, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { checkHealth } from '../services/api';
import { useAppStore } from '../store/appStore';

interface ServerStatus {
  api: 'checking' | 'online' | 'offline' | 'error';
  ws: 'connecting' | 'connected' | 'disconnected';
  lastError: string | null;
}

export const useServerConnection = () => {
  const { isAuthenticated, currentUser } = useAppStore();
  const [status, setStatus] = useState<ServerStatus>({
    api: 'checking',
    ws: 'disconnected',
    lastError: null,
  });
  
  // Проверка API сервера
  const checkServer = useCallback(async () => {
    setStatus(prev => ({ ...prev, api: 'checking' }));
    
    try {
      const isOnline = await checkHealth();
      if (isOnline) {
        setStatus(prev => ({ ...prev, api: 'online', lastError: null }));
      } else {
        setStatus(prev => ({ 
          ...prev, 
          api: 'offline', 
          lastError: 'Сервер недоступен' 
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Сервер недоступен';
      setStatus(prev => ({ 
        ...prev, 
        api: 'offline', 
        lastError: errorMessage 
      }));
    }
  }, []);
  
  // Подключение WebSocket при авторизации
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const token = localStorage.getItem('wintozo_token');
      if (token) {
        wsService.connect(token);
      }
      
      // Обработчики событий WebSocket
      const unsubConnect = wsService.onConnect(() => {
        setStatus(prev => ({ ...prev, ws: 'connected' }));
      });
      
      const unsubDisconnect = wsService.onDisconnect(() => {
        setStatus(prev => ({ ...prev, ws: 'disconnected' }));
      });
      
      return () => {
        unsubConnect();
        unsubDisconnect();
      };
    }
  }, [isAuthenticated, currentUser]);
  
  // Проверять API каждые 30 секунд
  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, [checkServer]);
  
  return {
    status,
    isOnline: status.api === 'online',
    isConnected: status.ws === 'connected',
    checkServer,
    reconnectWs: () => {
      const token = localStorage.getItem('wintozo_token');
      if (token) {
        wsService.disconnect();
        wsService.connect(token);
      }
    },
  };
};
