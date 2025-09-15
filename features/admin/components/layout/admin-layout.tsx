"use client";

import * as React from "react";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Book,
  CodeXml,
  Home,
  LogOut,
  ScrollIcon,
  Tags,
  User,
} from "lucide-react";

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

import {
  ImageAssets,
  NICKNAME,
  PATHS,
  PATHS_MAP,
  PLACEHOLDER_TEXT,
} from "@/constants";
import { SignOutDialog } from "@/features/auth";
import { cn } from "@/lib/utils";

export const adminNavItems: {
  label?: string;
  link: string;
  icon?: React.ReactNode;
  breadcrumbs?: string[];
  hidden?: boolean;
}[] = [
  {
    label: PATHS_MAP[PATHS.ADMIN_HOME],
    link: PATHS.ADMIN_HOME,
    icon: <Home className="size-4" />,
    breadcrumbs: [PATHS.ADMIN_HOME],
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_TAG],
    link: PATHS.ADMIN_TAG,
    icon: <Tags className="size-4" />,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_TAG],
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG],
    link: PATHS.ADMIN_BLOG,
    icon: <Book className="size-4" />,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_BLOG],
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_SNIPPET],
    link: PATHS.ADMIN_SNIPPET,
    icon: <CodeXml className="size-4" />,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_SNIPPET],
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_NOTE],
    link: PATHS.ADMIN_NOTE,
    icon: <ScrollIcon className="size-4" />,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_NOTE],
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_USER],
    link: PATHS.ADMIN_USER,
    icon: <User className="size-4" />,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_USER],
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG_CREATE],
    link: PATHS.ADMIN_BLOG_CREATE,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_BLOG, PATHS.ADMIN_BLOG_CREATE],
    hidden: true,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG_EDIT],
    link: PATHS.ADMIN_BLOG_EDIT,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_BLOG, PATHS.ADMIN_BLOG_EDIT],
    hidden: true,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_SNIPPET_CREATE],
    link: PATHS.ADMIN_SNIPPET_CREATE,
    breadcrumbs: [
      PATHS.ADMIN_HOME,
      PATHS.ADMIN_SNIPPET,
      PATHS.ADMIN_SNIPPET_CREATE,
    ],
    hidden: true,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG_EDIT],
    link: PATHS.ADMIN_BLOG_EDIT,
    breadcrumbs: [PATHS.ADMIN_HOME, PATHS.ADMIN_SNIPPET, PATHS.ADMIN_BLOG_EDIT],
    hidden: true,
  },
];

export const AdminLayout = ({ children }: React.PropsWithChildren) => {
  const session = useSession();
  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="relative flex flex-col">
      <header
        className={`
          sticky inset-x-0 top-0 z-20 flex h-16 items-center border-b bg-background/50 px-5
          backdrop-blur
        `}
      >
        <Link href={PATHS.SITE_HOME} className="flex items-center">
          <img src={ImageAssets.logo} className="mr-2 size-8 border" />
          <span className="text-base font-semibold">{NICKNAME}后台管理</span>
        </Link>
        <nav className="flex h-full flex-1 items-center gap-8 px-10">
          {adminNavItems
            .filter((el) => !el.hidden)
            .map((el) => (
              <Link
                key={el.link}
                href={el.link}
                className={cn(
                  buttonVariants({
                    variant: pathname === el.link ? "default" : "ghost",
                  }),
                )}
              >
                {el.label}
              </Link>
            ))}
        </nav>

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
      </header>
      <main className="flex-1">{children}</main>

      <SignOutDialog open={signOutDialogOpen} setOpen={setSignOutDialogOpen} />
    </div>
  );
};
