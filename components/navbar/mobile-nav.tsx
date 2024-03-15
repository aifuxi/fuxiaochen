'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { SLOGAN, WEBSITE } from '@/constants';
import { cn } from '@/lib/utils';

import { navItems } from './config';

import { IconSolarDocumentText } from '../icons';

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
          <IconSolarDocumentText className="text-base" />
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
