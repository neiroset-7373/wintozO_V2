// Компонент статуса подключения к серверу
import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useServerConnection } from '../hooks/useServerConnection';

interface ServerStatusProps {
  compact?: boolean;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ compact = false }) => {
  const { status, isOnline, checkServer } = useServerConnection();
  
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Cloud className="w-3 h-3 text-green-400" />
        ) : (
          <CloudOff className="w-3 h-3 text-red-400" />
        )}
        {status.ws === 'connected' ? (
          <Wifi className="w-3 h-3 text-green-400" />
        ) : (
          <WifiOff className="w-3 h-3 text-yellow-400" />
        )}
      </div>
    );
  }
  
  return (
    <div className="p-3 rounded-lg bg-[var(--sidebar)] border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text)]">Статус сервера</span>
        <button
          onClick={checkServer}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title="Проверить подключение"
        >
          <RefreshCw className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>
      
      <div className="space-y-2">
        {/* API Status */}
        <div className="flex items-center gap-2">
          {status.api === 'checking' ? (
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          ) : status.api === 'online' ? (
            <div className="w-2 h-2 rounded-full bg-green-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-red-400" />
          )}
          <span className="text-xs text-[var(--text-secondary)]">
            API: {status.api === 'checking' ? 'Проверка...' : status.api === 'online' ? 'Онлайн' : 'Офлайн'}
          </span>
        </div>
        
        {/* WebSocket Status */}
        <div className="flex items-center gap-2">
          {status.ws === 'connecting' ? (
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          ) : status.ws === 'connected' ? (
            <div className="w-2 h-2 rounded-full bg-green-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          )}
          <span className="text-xs text-[var(--text-secondary)]">
            WebSocket: {status.ws === 'connecting' ? 'Подключение...' : status.ws === 'connected' ? 'Подключено' : 'Отключено'}
          </span>
        </div>
        
        {/* Error message */}
        {status.lastError && (
          <div className="mt-2 p-2 rounded bg-red-500/20 border border-red-500/30">
            <p className="text-xs text-red-400">{status.lastError}</p>
          </div>
        )}
        
        {/* Offline mode notice */}
        {status.api !== 'online' && (
          <div className="mt-2 p-2 rounded bg-yellow-500/20 border border-yellow-500/30">
            <p className="text-xs text-yellow-400">
              Работа в оффлайн режиме. Сообщения сохраняются локально.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerStatus;
