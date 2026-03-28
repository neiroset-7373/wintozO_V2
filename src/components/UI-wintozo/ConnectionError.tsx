import React from 'react';

interface ConnectionErrorProps {
  errorCode: number;
  errorType: string;
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  errorCode,
  errorType,
  message,
  onRetry,
  isRetrying,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 bg-red-500/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            
            {/* Animated waves */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-red-500/30 rounded-full animate-ping" />
            </div>
          </div>
        </div>

        {/* Error code */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2 mb-4">
            <span className="text-red-400 font-mono text-sm">Error {errorCode}:</span>
            <span className="text-red-300 font-mono text-sm">({errorType})</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Ошибка подключения
          </h1>
          
          <p className="text-gray-400 text-lg">
            {message}
          </p>
        </div>

        {/* Details */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-400">
              <p className="mb-2">Возможные причины:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Нет подключения к интернету</li>
                <li>Серверы Wintozo временно недоступны</li>
                <li>Проблемы с вашим интернет-провайдером</li>
                <li>Технические работы на сервере</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Network status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {navigator.onLine ? 'Интернет: подключен' : 'Интернет: отключен'}
          </span>
        </div>

        {/* Retry button */}
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25"
        >
          {isRetrying ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Подключение...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Попробовать снова
            </>
          )}
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Wintozo Messenger • v1.0.0
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Если проблема сохраняется, напишите в поддержку
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionError;
