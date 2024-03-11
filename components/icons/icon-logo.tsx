'use client';

import { useTheme } from 'next-themes';

import { WEBSITE } from '@/config';

import { cn } from '@/lib/utils';

type IconLogoProps = {
  className?: string;
};

export const IconLogo = ({ className }: IconLogoProps) => {
  const { resolvedTheme } = useTheme();
  return (
    <img
      src={
        resolvedTheme === 'dark'
          ? '/images/fuxiaochen-light.svg'
          : '/images/fuxiaochen-dark.svg'
      }
      className={cn('w-6 h-6', className)}
      alt={WEBSITE}
    />
  );
};
