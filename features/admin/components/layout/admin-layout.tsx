'use client';

import React from 'react';

import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

import { adminNavItems } from './admin-content-layout';

export const AdminLayout = ({ children }: React.PropsWithChildren) => {
  const pathname = usePathname();

  return (
    <SessionProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            {adminNavItems.map((el) => (
              <Tooltip key={el.link}>
                <TooltipTrigger asChild>
                  <Link
                    href={el.link}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                      el.link === pathname ? 'bg-accent' : '',
                    )}
                  >
                    {el.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{el.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </nav>
        </aside>

        {children}
      </div>
    </SessionProvider>
  );
};
