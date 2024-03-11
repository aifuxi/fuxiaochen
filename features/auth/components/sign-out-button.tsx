'use client';

import { LogOutIcon } from 'lucide-react';

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

import { signoutAndRedirect } from '../actions/signout';

export const SignOutButton = () => {
  async function handleLogout() {
    await signoutAndRedirect();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="!w-full text-lg">
          <LogOutIcon size={24} className="mr-2 " />
          Log Out
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
