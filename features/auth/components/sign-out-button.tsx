'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { IconSolarLogout2 } from '@/components/icons';

import { cn } from '@/lib/utils';

import { signoutAndRedirect } from '../actions/signout';

export const SignOutButton = () => {
  async function handleLogout() {
    await signoutAndRedirect();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={cn(
            'lg:!w-full text-lg text-primary-foreground bg-muted-foreground/10 hover:bg-muted-foreground/20',
          )}
        >
          <IconSolarLogout2 className="lg:mr-2 lg:text-2xl" />
          <span className="hidden lg:inline-block">退出登录</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>温馨提示</AlertDialogTitle>
          <AlertDialogDescription>确定要退出登录吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>确定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
