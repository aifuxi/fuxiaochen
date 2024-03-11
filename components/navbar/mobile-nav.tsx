'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AlignJustifyIcon } from 'lucide-react';

import { SLOGAN, WEBSITE } from '@/config';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { cn } from '@/lib/utils';

import { navItems } from './nav-list';

export const MobileNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={'outline'}
          size={'icon'}
          aria-label="菜单"
          className={cn('sm:hidden')}
        >
          <AlignJustifyIcon size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'}>
        <SheetHeader>
          <SheetTitle>{WEBSITE}</SheetTitle>
          <SheetDescription>{SLOGAN}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 pt-8">
          {navItems.map((el) => (
            <Link
              key={el.link}
              href={el.link}
              className={cn(
                buttonVariants({
                  variant: pathname === el.link ? 'default' : 'ghost',
                }),
                'text-md px-4 py-2 flex gap-2 items-center !justify-start w-full',
              )}
              onClick={() => {
                setOpen(false);
              }}
            >
              {el.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
