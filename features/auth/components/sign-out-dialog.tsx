"use client";

import * as React from "react";

import { LoaderCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { signOutAndRedirect } from "../actions/sign-out";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SignOutDialog = ({ open, setOpen }: Props) => {
  const [isPending, startTransition] = React.useTransition();

  async function handleLogout() {
    startTransition(async () => {
      await signOutAndRedirect();
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>温馨提示</AlertDialogTitle>
          <AlertDialogDescription>确定要退出登录吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            确定
            {isPending && <LoaderCircle className="ml-2 animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
