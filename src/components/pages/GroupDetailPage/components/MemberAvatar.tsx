// src/components/pages/GroupDetailPage/components/MemberAvatar.tsx

import Image from 'next/image';
import { cn } from '@/src/components/ui/utils';

interface MemberAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  gradientVariant?: 'cyan' | 'violet' | 'amber' | 'neutral';
}

const SIZES = {
  sm: { container: 'h-8 w-8', text: 'text-[10px]', img: 32 },
  md: { container: 'h-10 w-10', text: 'text-xs', img: 40 },
  lg: { container: 'h-12 w-12', text: 'text-sm', img: 48 },
};

const GRADIENTS = {
  cyan: 'from-cyan-400 to-teal-500',
  violet: 'from-violet-400 to-purple-500',
  amber: 'from-amber-400 to-orange-500',
  neutral: 'from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function MemberAvatar({
  name,
  photoUrl,
  size = 'md',
  className,
  gradientVariant = 'neutral',
}: MemberAvatarProps) {
  const { container, text, img } = SIZES[size];
  const gradient = GRADIENTS[gradientVariant];

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={img}
        height={img}
        className={cn(
          'rounded-full object-cover shrink-0',
          container,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0',
        `bg-linear-to-br ${gradient}`,
        container,
        text,
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
