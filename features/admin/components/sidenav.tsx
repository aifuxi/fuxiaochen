'use client';

import React from 'react';

import { type Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { IconSolarArrowRightUpLinear } from '@/components/icons';

import { PATHS, PLACEHODER_TEXT } from '@/constants';
import { SignOutButton } from '@/features/auth';
import { isAdmin } from '@/lib/utils';

import { Sidebar } from './sidebar';

const Desc = ({ session }: { session: Session | null }) => {
  return isAdmin(session?.user?.email) ? (
    <div className="flex justify-center flex-col items-center space-y-1">
      <Badge className="bg-background text-foreground">管理员</Badge>
      <p className="text-xs text-muted-foreground font-medium">拥有所有权限</p>
    </div>
  ) : (
    <div className="flex justify-center flex-col items-center space-y-1">
      <Badge className="bg-background text-foreground">游客</Badge>
      <p className="text-xs text-muted-foreground font-medium">
        只能查看部分数据
      </p>
    </div>
  );
};

export const Sidenav = () => {
  const { data: session } = useSession();

  return (
    <aside className="w-[160px] transition-all h-screen flex-col flex items-center justify-center py-12 border-r">
      <Avatar className="w-14 h-14 border">
        <AvatarImage
          src={session?.user?.image ?? ''}
          alt={session?.user?.name ?? PLACEHODER_TEXT}
        />
        <AvatarFallback>{PLACEHODER_TEXT}</AvatarFallback>
      </Avatar>
      <h4 className="hidden lg:block text-lg font-semibold tracking-tight mt-2 ">
        {session?.user?.name ?? PLACEHODER_TEXT}
      </h4>
      <Desc session={session} />
      <div className="w-full flex-col flex items-center px-2 space-y-4">
        <Sidebar />
      </div>
      <div className="flex justify-center lg:grid mt-6 2xl:mt-12 w-full space-y-2">
        <SignOutButton />

        <Button asChild className="lg:!w-full">
          <Link href={PATHS.SITE_HOME} target="_blank">
            <span>去前台首页</span>
            <IconSolarArrowRightUpLinear />
          </Link>
        </Button>
      </div>
    </aside>
  );
};
