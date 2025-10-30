"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogOut, User } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ModeToggle } from "@/components/mode-toggle";

import { PATHS, PLACEHOLDER_TEXT } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { SignOutDialog } from "./components/sign-out-dialog";

export default function Layout({ children }: React.PropsWithChildren) {
  const { data: session } = authClient.useSession();
  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false);
  const pathname = usePathname();

  const nav = [
    {
      label: "首页",
      href: PATHS.ADMIN_HOME,
    },
    {
      label: "博客",
      href: PATHS.ADMIN_BLOG,
    },
    {
      label: "分类",
      href: PATHS.ADMIN_CATEGORY,
    },
    {
      label: "标签",
      href: PATHS.ADMIN_TAG,
    },
    {
      label: "用户",
      href: PATHS.ADMIN_USER,
    },
  ];

  return (
    <div className="flex h-screen flex-col">
      <header
        className={`
          sticky inset-x-0 top-0 z-[5] flex h-16 shrink-0 items-center gap-2 bg-background/50 px-5 backdrop-blur
        `}
      >
        <Image
          src="/images/fuxiaochen-logo.svg"
          alt="logo"
          width={20}
          height={20}
        />
        <h2 className="mr-8 text-base font-bold">后台管理</h2>
        <ul className="flex items-center gap-4">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: pathname === item.href ? "default" : "ghost",
                  }),
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-2">
            <ModeToggle variant="ghost" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name ?? PLACEHOLDER_TEXT}
                      </span>
                      <span className="truncate text-xs">
                        {session?.user?.email ?? PLACEHOLDER_TEXT}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSignOutDialogOpen(true);
                  }}
                >
                  <LogOut />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-5">{children}</main>
      <SignOutDialog open={signOutDialogOpen} setOpen={setSignOutDialogOpen} />
    </div>
  );
}
