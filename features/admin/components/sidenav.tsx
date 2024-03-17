import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { PLACEHODER_TEXT } from '@/constants';
import { SignOutButton } from '@/features/auth';
import { auth } from '@/lib/auth';

import { Sidebar } from './sidebar';

export const Sidenav = async () => {
  const session = await auth();

  return (
    <aside className="min-w-[256px] max-w-[256px] h-screen flex-col flex items-center py-12 px-8 bg-foreground">
      <Avatar className="w-14 h-14 border border-muted-foreground/10">
        <AvatarImage
          src={session?.user?.image ?? ''}
          alt={session?.user?.name ?? PLACEHODER_TEXT}
        />
        <AvatarFallback>{PLACEHODER_TEXT}</AvatarFallback>
      </Avatar>
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mt-2 text-primary-foreground">
        {session?.user?.name ?? PLACEHODER_TEXT}
      </h4>
      <div className="w-full flex-col flex items-center mt-24 space-y-8">
        <Sidebar />
      </div>
      <div className="mt-24 grid w-full">
        <SignOutButton />
      </div>
    </aside>
  );
};
