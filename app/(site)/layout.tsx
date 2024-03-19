import Link from 'next/link';

import { badgeVariants } from '@/components/ui/badge';

import { IconSolarShieldNetwork } from '@/components/icons';
import { Navbar } from '@/components/navbar';

import { BEI_AN_LINK, BEI_AN_NUMBER, NICKNAME } from '@/constants';
import { cn } from '@/lib/utils';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-256px)]">{children}</main>
      <footer className="w-full flex flex-col space-y-2 items-center py-16 max-w-screen-xl mx-auto">
        <div className="w-full text-center">
          &copy;<span className="ml-0.5 mr-2">{new Date().getFullYear()}</span>
          {NICKNAME}
        </div>
        <div>
          <Link
            className={cn(
              badgeVariants({ variant: 'outline' }),
              'rounded text-muted-foreground hover:text-primary',
            )}
            target="_blank"
            aria-label={BEI_AN_NUMBER}
            href={BEI_AN_LINK}
          >
            <IconSolarShieldNetwork className="mr-1" />
            {BEI_AN_NUMBER}
          </Link>
        </div>
      </footer>
    </>
  );
}
