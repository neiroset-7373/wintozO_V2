import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);

  const handleContinue = () => {
    setHasSeenOnboarding(true);
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
              <path d="M10 20C10 20 20 10 30 10C40 10 50 20 50 30C50 40 40 50 30 50C20 50 12 44 10 36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M10 36L6 48L18 44" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="22" cy="30" r="3" fill="white" />
              <circle cx="30" cy="30" r="3" fill="white" />
              <circle cx="38" cy="30" r="3" fill="white" />
            </svg>
          </div>
          <div
            className="absolute inset-0 rounded-3xl blur-xl opacity-30"
            style={{ background: 'var(--accent-gradient)' }}
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--text)' }}>
            Wintozo
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Вы уже зарегистрированы в нашем мессенджере?
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            className="w-full py-4 rounded-2xl text-lg font-bold text-white shadow-lg transition-all"
            style={{ background: 'var(--accent-gradient)' }}
          >
            ✅ Да, войти
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            className="w-full py-4 rounded-2xl text-lg font-bold border-2 transition-all"
            style={{
              background: 'transparent',
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
            }}
          >
            📝 Нет, зарегистрироваться
          </motion.button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 grid grid-cols-3 gap-4 w-full"
        >
          {[
            { emoji: '🔒', text: 'Безопасность' },
            { emoji: '⚡', text: 'Быстро' },
            { emoji: '🌍', text: 'Везде' },
          ].map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl mb-1">{f.emoji}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {f.text}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
