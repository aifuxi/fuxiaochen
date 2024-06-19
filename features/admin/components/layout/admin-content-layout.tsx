"use client";

import React from "react";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { Book, CodeXml, Home, PanelLeft, ScrollIcon, Tags } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { BackToTop } from "@/components/back-to-top";
import { ModeToggle } from "@/components/mode-toggle";

import { PATHS, PATHS_MAP, PLACEHOLDER_TEXT } from "@/constants";
import { SignOutDialog } from "@/features/auth";
import { cn, isAdmin } from "@/lib/utils";

import { SettingsModal } from "../settings";

type AdminContentLayoutProps = {
  breadcrumb?: React.ReactNode;
} & React.PropsWithChildren;

export const adminNavItems: Array<{
  label?: string;
  link: string;
  icon?: React.ReactNode;
}> = [
  {
    label: PATHS_MAP[PATHS.ADMIN_HOME],
    link: PATHS.ADMIN_HOME,
    icon: <Home className="size-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_TAG],
    link: PATHS.ADMIN_TAG,
    icon: <Tags className="size-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG],
    link: PATHS.ADMIN_BLOG,
    icon: <Book className="size-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_SNIPPET],
    link: PATHS.ADMIN_SNIPPET,
    icon: <CodeXml className="size-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_NOTE],
    link: PATHS.ADMIN_NOTE,
    icon: <ScrollIcon className="size-4" />,
  },
];

export const AdminContentLayout = ({
  children,
  breadcrumb,
}: AdminContentLayoutProps) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const session = useSession();
  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);

  return (
    <div className="h-screen flex-1 overflow-hidden">
      <header className="fixed inset-x-0 top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              {adminNavItems.map((el) => (
                <Link
                  key={el.link}
                  href={el.link}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  {el.icon}
                  {el.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        {breadcrumb}

        <div className="flex items-center space-x-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "cursor-pointer",
                )}
              >
                <AvatarImage
                  src={session?.data?.user?.image ?? ""}
                  className="!size-6 rounded-[8px]"
                  alt={session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                />
                <AvatarFallback className="line-clamp-1 size-6 text-ellipsis rounded-[8px]">
                  {session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="cursor-pointer">
                我的账号
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSettingsModalOpen(true)}
              >
                设置
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                帮助
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSignOutDialogOpen(true)}
              >
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ScrollArea ref={scrollRef} className="h-screen px-6 pt-6">
        {children}

        {/* padding */}
        <div className="h-32"></div>
      </ScrollArea>

      <BackToTop scrollRef={scrollRef} />

      <SignOutDialog open={signOutDialogOpen} setOpen={setSignOutDialogOpen} />

      {isAdmin(session?.data?.user?.email) && (
        <SettingsModal
          open={settingsModalOpen}
          setOpen={setSettingsModalOpen}
        />
      )}
    </div>
  );
};
