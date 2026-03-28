import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.8, duration: 0.6, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="w-28 h-28 rounded-3xl shadow-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-gradient)' }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path
                d="M10 20C10 20 20 10 30 10C40 10 50 20 50 30C50 40 40 50 30 50C20 50 12 44 10 36"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M10 36L6 48L18 44"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="22" cy="30" r="3" fill="white" />
              <circle cx="30" cy="30" r="3" fill="white" />
              <circle cx="38" cy="30" r="3" fill="white" />
            </svg>
          </div>
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-3xl blur-xl opacity-40"
            style={{ background: 'var(--accent-gradient)' }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Wintozo
          </h1>
          <p className="mt-2 text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
            Мессенджер нового поколения
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-2 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        v1.0.0
      </motion.p>
    </div>
  );
}
