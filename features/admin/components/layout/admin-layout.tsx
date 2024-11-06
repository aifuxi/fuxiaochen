"use client";

import * as React from "react";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import {
  Book,
  ChevronsUpDown,
  CodeXml,
  Home,
  LogOut,
  ScrollIcon,
  Tags,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Logo } from "@/components/logo";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

import { PATHS, PATHS_MAP, PLACEHOLDER_TEXT, WEBSITE } from "@/constants";
import { SignOutDialog } from "@/features/auth";

export const adminNavItems: Array<{
  label?: string;
  link: string;
  icon?: React.ReactNode;
  breadcrumbs?: string[];
  hidden?: boolean;
}> = [
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
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href={PATHS.SITE_HOME} target="_blank" rel="noreferrer">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Logo />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{WEBSITE}</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {adminNavItems
                .filter((el) => !el?.hidden)
                .map((item) => (
                  <Collapsible key={item.link} asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={item.link === pathname}
                      >
                        <a href={item.link}>
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={session?.data?.user?.image ?? ""}
                        alt={session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                      />
                      <AvatarFallback className="rounded-lg">FC</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                      </span>
                      <span className="truncate text-xs">
                        {session?.data?.user?.email ?? PLACEHOLDER_TEXT}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage
                          src={session?.data?.user?.image ?? ""}
                          alt={session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                        />
                        <AvatarFallback className="rounded-lg">
                          {session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {session?.data?.user?.name ?? PLACEHOLDER_TEXT}
                        </span>
                        <span className="truncate text-xs">
                          {session?.data?.user?.email ?? PLACEHOLDER_TEXT}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setSignOutDialogOpen(true)}
                  >
                    <LogOut className="size-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <PageBreadcrumb
              breadcrumbList={
                adminNavItems.find((el) => el.link === pathname)?.breadcrumbs
              }
            />
          </div>
        </header>
        <ScrollArea className="flex max-h-[calc(100vh-4rem-1rem)] flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </ScrollArea>
      </SidebarInset>

      <SignOutDialog open={signOutDialogOpen} setOpen={setSignOutDialogOpen} />
    </SidebarProvider>
  );
};
