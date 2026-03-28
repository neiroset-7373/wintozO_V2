import { motion } from 'framer-motion';

interface VerifiedBadgeProps {
  size?: number;
  small?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export default function VerifiedBadge({ 
  size, 
  small = false, 
  isAdmin = false, 
  className = '' 
}: VerifiedBadgeProps) {
  const s = size ?? (small ? 12 : 16);
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      {isAdmin ? (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="url(#admin-gradient)" />
          <path
            d="M12 6L14 10L18 10.5L15 13.5L16 18L12 16L8 18L9 13.5L6 10.5L10 10L12 6Z"
            fill="white"
          />
          <defs>
            <linearGradient id="admin-gradient" x1="2" y1="2" x2="22" y2="22">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="url(#verified-gradient)" />
          <path
            d="M8 12L11 15L16 9"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="verified-gradient" x1="2" y1="2" x2="22" y2="22">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </motion.div>
  );
}
