import Link from 'next/link';

import { cn } from '@/lib/utils';

import { buttonVariants } from '../ui/button';

export type NextLinkProps = React.ComponentProps<typeof Link>;

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
      <a href=""></a>
      {children}
    </Link>
  );
};
