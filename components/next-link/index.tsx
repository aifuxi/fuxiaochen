import Link, { type LinkProps } from 'next/link';

import { type FCProps } from '@/types';

import { cn } from '@/utils/helper';

import { buttonVariants } from '../ui/button';

export type NextLinkProps = LinkProps & { className?: string } & FCProps;

export const NextLink = ({ className, children, ...props }: NextLinkProps) => {
  return (
    <Link
      {...props}
      className={cn(
        buttonVariants({ variant: 'link' }),
        'text-muted-foreground hover:text-primary',
        className,
      )}
    >
      {children}
    </Link>
  );
};
