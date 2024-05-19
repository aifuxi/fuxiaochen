'use client';

import React from 'react';

import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PanelLeftClose, PanelRightClose } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';

import { Logo } from '@/components/logo';

import { NICKNAME, PATHS, WEBSITE } from '@/constants';
import { cn } from '@/lib/utils';

import { adminNavItems } from './admin-content-layout';

export const AdminLayout = ({ children }: React.PropsWithChildren) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);

  return (
    <SessionProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <aside
          className={cn(
            'hidden flex-col border-r bg-background sm:flex transition-all',
            open ? 'w-36' : 'w-14',
          )}
        >
          <Link
            href={PATHS.SITE_HOME}
            className={cn(
              'hidden sm:flex mt-[10vh] mb-[5vh] justify-center items-center whitespace-nowrap',
            )}
            aria-label={NICKNAME}
          >
            <Logo className="w-8 h-8" />
            {open && (
              <span className="ml-2 font-semibold text-primary text-base">
                {WEBSITE}
              </span>
            )}
          </Link>
          <nav
            className={cn(
              'h-full flex flex-col items-center gap-4 sm:py-5',
              open ? 'px-4' : 'px-2',
            )}
          >
            {adminNavItems.map((el) => (
              <Link
                key={el.link}
                href={el.link}
                className={cn(
                  buttonVariants({
                    variant: el.link === pathname ? 'default' : 'ghost',
                    size: open ? 'default' : 'icon',
                  }),
                  '!w-full transition-all',
                )}
              >
                {el.icon}
                {open && <span className="ml-4 text-sm">{el.label}</span>}
              </Link>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Button size={'icon'} variant={'outline'}>
              {open ? (
                <PanelLeftClose
                  className="h-5 w-5"
                  onClick={() => setOpen(false)}
                />
              ) : (
                <PanelRightClose
                  className="h-5 w-5"
                  onClick={() => setOpen(true)}
                />
              )}
            </Button>
          </nav>
        </aside>

        {children}
      </div>
    </SessionProvider>
  );
};
