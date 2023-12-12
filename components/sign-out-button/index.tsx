'use client';

import { signOut } from 'next-auth/react';

import { PowerIcon } from 'lucide-react';

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

export function SignOutButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'secondary'} className="!w-full">
          <PowerIcon size={16} className="mr-2 " />
          退出登录
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>温馨提示</AlertDialogTitle>
          <AlertDialogDescription>确定要退出登录吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await signOut();
            }}
          >
            确定退出登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
