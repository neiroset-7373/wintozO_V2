import { getInitials } from '../../utils/helpers';
import VerifiedBadge from './VerifiedBadge';

interface AvatarProps {
  name: string;
  gradient: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isBot?: boolean;
  isVerified?: boolean;
  isAdmin?: boolean;
  isChannel?: boolean;
}

const sizes = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

const badgeSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 22,
};

export default function Avatar({
  name,
  gradient,
  size = 'md',
  isOnline,
  isBot,
  isVerified,
  isAdmin,
  isChannel,
}: AvatarProps) {
  const showVerified = (isVerified || isAdmin) && !isOnline;

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${gradient}`}
      >
        {isChannel ? '📢' : isBot ? '🤖' : getInitials(name)}
      </div>

      {/* Online indicator */}
      {isOnline !== undefined && !isBot && !isVerified && !isAdmin && (
        <div
          className={`absolute bottom-0 right-0 rounded-full border-2 ${
            size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
          }`}
          style={{
            background: isOnline ? '#22c55e' : '#6b7280',
            borderColor: 'var(--sidebar)',
          }}
        />
      )}

      {/* Verified/Admin badge */}
      {showVerified && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <VerifiedBadge size={badgeSizes[size]} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  );
}
