import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ background: 'var(--chat)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-xs px-6"
      >
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Wintozo
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Выберите чат слева чтобы начать общение
        </p>
        <div className="mt-6 flex gap-3 justify-center text-2xl">
          <span>🔒</span>
          <span>⚡</span>
          <span>🌍</span>
        </div>
      </motion.div>
    </div>
  );
}
