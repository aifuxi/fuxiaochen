"use client";

import * as React from "react";

import { useSession } from "next-auth/react";

import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ModeToggle } from "@/components/mode-toggle";

import { PLACEHOLDER_TEXT } from "@/constants";
import { SignOutDialog } from "@/features/auth";

import { AppSidebar } from "../app-sidebar";

export function AdminLayoutV2({ children }: React.PropsWithChildren) {
  const session = useSession();
  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className={`
            sticky inset-x-0 top-0 z-[5] flex h-16 shrink-0 items-center gap-2 bg-background/50
            px-10 backdrop-blur
          `}
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className={`
                mr-2
                data-[orientation=vertical]:h-4
              `}
            />
          </div>
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
                          {session.data?.user?.name ?? PLACEHOLDER_TEXT}
                        </span>
                        <span className="truncate text-xs">
                          {session.data?.user?.email ?? PLACEHOLDER_TEXT}
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
        <main className="h-full">{children}</main>
        <SignOutDialog
          open={signOutDialogOpen}
          setOpen={setSignOutDialogOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
