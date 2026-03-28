import type { User } from '../types';

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
  'from-lime-500 to-green-600',
  'from-red-500 to-orange-600',
];

export function generateAvatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const LS_COUNTER = 'wintozo_user_counter';

export function getNextUserId(): string {
  try {
    const raw = localStorage.getItem(LS_COUNTER);
    const current = raw ? parseInt(raw, 10) : 0;
    const next = current + 1;
    localStorage.setItem(LS_COUNTER, String(next));
    return String(next).padStart(6, '0');
  } catch {
    return String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  }
}

export function generateUsername(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_а-яёa-z]/gi, '')
    .slice(0, 20);
}

export function formatUsername(username: string): string {
  return `@${username}`;
}

export function createUser(login: string, displayName: string): User {
  const userId = getNextUserId();
  const username = generateUsername(displayName) || login.toLowerCase();
  return {
    id: generateId(),
    userId,
    username,
    login: login.toLowerCase().trim(),
    displayName: displayName.trim(),
    avatarColor: generateAvatarGradient(login),
    createdAt: Date.now(),
  };
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < dayMs * 7) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  }
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

export function formatFullTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatSubscribers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M подписчиков`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K подписчиков`;
  return `${count} подписчиков`;
}

export function formatVoiceDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getBotResponse(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('/help') || lower.includes('помощь')) {
    return `🤖 **Команды Wintozo Bot:**

/help — показать эту справку
/time — текущее время
/date — сегодняшняя дата
/joke — рассказать шутку
/quote — мотивирующая цитата
/calc <выражение> — калькулятор

Или просто напиши мне что-нибудь! 😊`;
  }
  
  if (lower.includes('/time') || lower.includes('время')) {
    return `🕐 Сейчас ${new Date().toLocaleTimeString('ru-RU')}`;
  }
  
  if (lower.includes('/date') || lower.includes('дата')) {
    return `📅 Сегодня ${new Date().toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  }
  
  if (lower.includes('/joke') || lower.includes('шутк')) {
    const jokes = [
      '😄 Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 == Dec 25!',
      '🤣 — Алло, это прачечная? — Нет, это программист. — А почему у вас в статусе "Стираю баги"?',
      '😂 Оптимист видит стакан наполовину полным, пессимист — наполовину пустым, а программист — стакан вдвое больше необходимого.',
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  if (lower.includes('/quote') || lower.includes('цитат')) {
    const quotes = [
      '💫 "Код — это поэзия." — Линус Торвальдс',
      '🚀 "Сначала сделай, чтобы работало. Потом сделай правильно. Потом сделай быстро."',
      '✨ "Лучший код — это отсутствие кода."',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  if (lower.includes('привет') || lower.includes('здравствуй') || lower.includes('хай')) {
    return '👋 Привет! Как дела? Чем могу помочь?';
  }
  
  if (lower.includes('как дела') || lower.includes('как ты')) {
    return '🤖 Отлично! Работаю без сбоев. А ты как?';
  }
  
  if (lower.includes('спасибо') || lower.includes('благодар')) {
    return '😊 Всегда рад помочь! Обращайся!';
  }
  
  const responses = [
    '🤔 Интересно! Расскажи подробнее.',
    '👀 Хм, любопытно...',
    '💭 Дай мне подумать...',
    '✨ Отличная мысль!',
    '🎯 Понял тебя!',
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
