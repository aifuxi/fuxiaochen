import Image from 'next/image';
import Link from 'next/link';

import { badgeVariants } from '@/components/ui/badge';

import { IconSolarShieldNetwork } from '@/components/icons';
import { Navbar } from '@/components/navbar';

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
  NICKNAME,
} from '@/constants';
import { cn } from '@/lib/utils';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-190px)]">{children}</main>
      <footer className="w-full flex flex-col space-y-2 items-center py-8 max-w-screen-xl mx-auto text-muted-foreground">
        <div className="w-full text-center text-sm">
          &copy;<span className="ml-0.5 mr-2">{new Date().getFullYear()}</span>
          {NICKNAME}
        </div>
        <div className="flex space-x-4 items-center">
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
          <Link
            className={cn(
              badgeVariants({ variant: 'outline' }),
              'rounded text-muted-foreground hover:text-primary',
            )}
            target="_blank"
            aria-label={GONG_AN_NUMBER}
            href={GONG_AN_LINK}
          >
            <Image
              width={14}
              height={14}
              src="/images/gongan.png"
              alt={GONG_AN_NUMBER}
              className="mr-1 -translate-y-[1px]"
            />
            {GONG_AN_NUMBER}
          </Link>
        </div>
      </footer>
    </>
  );
}
