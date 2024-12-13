"use client";

import React from "react";

import { signOut, useSession } from "next-auth/react";

import { CircleUserRound, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useConfirm } from "@/hooks/use-confirm";

export const ProfileDropdown = () => {
  const session = useSession();
  const [SignOutDialog, confirmSignOut] = useConfirm({
    title: "提示",
    description: "确定要退出登录吗？",
  });

  const handleSignOut = async () => {
    const ok = await confirmSignOut();
    if (!ok) {
      return;
    }
    await signOut({ redirectTo: "/auth/login" });
  };

  return (
    <div>
      <SignOutDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <CircleUserRound className="size-12" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{session?.data?.user?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleSignOut}
          >
            <LogOut />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
