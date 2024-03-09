'use client';

import { useTheme } from 'next-themes';

import { WEBSITE } from '@/config';

export const IconLogo = () => {
  const { resolvedTheme } = useTheme();
  return (
    <img
      src={
        resolvedTheme === 'dark'
          ? '/images/fuxiaochen-light.svg'
          : '/images/fuxiaochen-dark.svg'
      }
      className="w-6 h-6"
      alt={WEBSITE}
    />
  );
};
