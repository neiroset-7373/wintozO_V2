import { motion } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { DeviceMode, ThemeName } from '../../types';
import { themeList } from '../../data/themes';

interface DeviceSelectProps {
  onComplete: () => void;
}

export default function DeviceSelect({ onComplete }: DeviceSelectProps) {
  const setDeviceMode = useAppStore((s) => s.setDeviceMode);
  const setDeviceType = useAppStore((s) => s.setDeviceType);
  const setTheme = useAppStore((s) => s.setTheme);
  const theme = useAppStore((s) => s.theme);

  const handleSelect = (mode: DeviceMode) => {
    setDeviceMode(mode);
    setDeviceType(mode);
    onComplete();
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
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
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Добро пожаловать!
          </h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Выбери тип устройства
          </p>
        </div>

        {/* Device cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            {
              mode: 'phone' as DeviceMode,
              icon: Smartphone,
              label: 'Телефон',
              desc: 'Компактный интерфейс',
            },
            {
              mode: 'desktop' as DeviceMode,
              icon: Monitor,
              label: 'Компьютер',
              desc: 'Сайдбар + чат',
            },
          ].map(({ mode, icon: Icon, label, desc }) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(mode)}
              className="relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
              style={{
                background: 'var(--sidebar)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <Icon size={28} color="white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" style={{ color: 'var(--text)' }}>{label}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Theme quick-select */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            🎨 Выбери тему
          </p>
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
      </motion.div>
    </div>
  );
}
