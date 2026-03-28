import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import * as api from '../../services/api';
import { generateAvatarGradient } from '../../utils/helpers';

export default function AuthScreen() {
  const storeLogin = useAppStore((s) => s.login);
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Проверка сервера при загрузке
  useEffect(() => {
    const checkServer = async () => {
      setServerStatus('checking');
      const isOnline = await api.checkHealth();
      setServerStatus(isOnline ? 'online' : 'offline');
    };
    checkServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация
    if (mode === 'register' && displayName.length < 2) {
      setError('Имя должно быть минимум 2 символа');
      setLoading(false);
      return;
    }
    if (loginValue.length < 3) {
      setError('Логин должен быть минимум 3 символа');
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setError('Пароль должен быть минимум 4 символа');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        // РЕАЛЬНАЯ регистрация на сервере
        const result = await api.register(loginValue, password, displayName || loginValue);
        
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (result.data) {
          const { user, token } = result.data;
          storeLogin({
            id: user.id,
            odudId: user.odudId,
            userId: user.odudId,
            username: user.username,
            login: user.username,
            displayName: user.displayName,
            avatarColor: generateAvatarGradient(user.username),
            avatar: user.avatar,
            isPro: user.isPro,
            proUntil: user.proUntil,
            createdAt: Date.now(),
          }, token);
        }
      } else {
        // РЕАЛЬНЫЙ вход на сервере
        const result = await api.login(loginValue, password);
        
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (result.data) {
          const { user, token, gotPro } = result.data;
          storeLogin({
            id: user.id,
            odudId: user.odudId,
            userId: user.odudId,
            username: user.username,
            login: user.username,
            displayName: user.displayName,
            avatarColor: generateAvatarGradient(user.username),
            avatar: user.avatar,
            isPro: user.isPro,
            proUntil: user.proUntil,
            createdAt: Date.now(),
          }, token);

          // Уведомление о получении Pro
          if (gotPro) {
            alert('🎉 Поздравляем! Вы получили Pro подписку за 7 дней активности!');
          }
        }
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }

    setLoading(false);
  };

  const retryServer = async () => {
    setServerStatus('checking');
    const isOnline = await api.checkHealth();
    setServerStatus(isOnline ? 'online' : 'offline');
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Server Status */}
        <div className="mb-4">
          <div 
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm ${
              serverStatus === 'online' 
                ? 'bg-green-500/20 text-green-400' 
                : serverStatus === 'offline' 
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {serverStatus === 'checking' && (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Подключение к серверу...</span>
              </>
            )}
            {serverStatus === 'online' && (
              <>
                <Wifi size={16} />
                <span>Сервер онлайн ✓</span>
              </>
            )}
            {serverStatus === 'offline' && (
              <>
                <WifiOff size={16} />
                <span>Сервер недоступен</span>
                <button 
                  onClick={retryServer}
                  className="ml-2 underline hover:no-underline"
                >
                  Повторить
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
              <path d="M10 20C10 20 20 10 30 10C40 10 50 20 50 30C50 40 40 50 30 50C20 50 12 44 10 36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M10 36L6 48L18 44" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="22" cy="30" r="3" fill="white" />
              <circle cx="30" cy="30" r="3" fill="white" />
              <circle cx="38" cy="30" r="3" fill="white" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {mode === 'login' ? 'Добро пожаловать!' : 'Создать аккаунт'}
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? 'Войдите в свой аккаунт Wintozo'
              : 'Присоединяйтесь к Wintozo'}
          </p>
        </div>

        {/* Mode switcher */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'var(--sidebar)', border: '1px solid var(--border)' }}
        >
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? 'white' : 'var(--text-secondary)',
              }}
            >
              {m === 'login' ? '🔑 Вход' : '✨ Регистрация'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none border transition-all"
                  style={{
                    background: 'var(--input-bg)',
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                  }}
                />
              </div>
            )}

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Логин"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                autoComplete="username"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none border transition-all"
                style={{
                  background: 'var(--input-bg)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm outline-none border transition-all"
                style={{
                  background: 'var(--input-bg)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || serverStatus === 'offline'}
              className="w-full py-3.5 rounded-2xl text-white font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {mode === 'login' ? 'Вход...' : 'Регистрация...'}
                </span>
              ) : serverStatus === 'offline' ? (
                '⚠️ Сервер недоступен'
              ) : mode === 'login' ? (
                'Войти'
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </div>
        </form>

        {/* Server info */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Сервер: wintozo-messenger.onrender.com
          </p>
          {serverStatus === 'offline' && (
            <p className="text-xs mt-2 text-yellow-500">
              ⚠️ Сервер спит (бесплатный Render). Подождите 1-2 минуты или{' '}
              <a 
                href="https://wintozo-messenger.onrender.com/api/v1/health" 
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                разбудите его
              </a>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
