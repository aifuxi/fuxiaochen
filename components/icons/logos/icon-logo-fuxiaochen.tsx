'use client';

import { useTheme } from 'next-themes';

import { WEBSITE } from '@/constants';
import { cn } from '@/lib/utils';

export const IconLogoFuXiaoChen = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLImageElement>) => {
  const { resolvedTheme } = useTheme();

  return (
    <img
      {...props}
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
