'use client';

import React from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import {
  Book,
  CodeXml,
  Home,
  LineChart,
  PanelLeft,
  ScrollIcon,
  Tags,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { BackToTop } from '@/components/back-to-top';
import { ModeToggle } from '@/components/mode-toggle';

import { PATHS, PATHS_MAP, PLACEHODER_TEXT } from '@/constants';
import { SignoutDialog } from '@/features/auth';

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
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_STATISTIC],
    link: PATHS.ADMIN_STATISTIC,
    icon: <LineChart className="h-4 w-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_TAG],
    link: PATHS.ADMIN_TAG,
    icon: <Tags className="h-4 w-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_BLOG],
    link: PATHS.ADMIN_BLOG,
    icon: <Book className="h-4 w-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_SNIPPET],
    link: PATHS.ADMIN_SNIPPET,
    icon: <CodeXml className="h-4 w-4" />,
  },
  {
    label: PATHS_MAP[PATHS.ADMIN_NOTE],
    link: PATHS.ADMIN_NOTE,
    icon: <ScrollIcon className="h-4 w-4" />,
  },
];

export const AdminContentLayout = ({
  children,
  breadcrumb,
}: AdminContentLayoutProps) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const session = useSession();
  const [signoutDialogOpen, setSignoutDialogOpen] = React.useState(false);

  return (
    <div className="flex-1 h-screen overflow-hidden">
      <header className="fixed top-0 inset-x-0 z-10 flex justify-between h-14 items-center gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-4 w-4" />
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

        <div className="flex space-x-4 items-center">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Avatar className="w-6 h-6 rounded-[8px]">
                  <AvatarImage
                    src={session?.data?.user?.image ?? ''}
                    alt={session?.data?.user?.name ?? PLACEHODER_TEXT}
                  />
                  <AvatarFallback className="w-6 h-6 rounded-[8px]">
                    {session?.data?.user?.name ?? PLACEHODER_TEXT}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>我的账号</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>设置</DropdownMenuItem>
              <DropdownMenuItem>帮助</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSignoutDialogOpen(true)}>
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ScrollArea ref={scrollRef} className="h-screen px-6 pt-6">
        {children}
      </ScrollArea>

      <BackToTop scrollRef={scrollRef} />

      <SignoutDialog open={signoutDialogOpen} setOpen={setSignoutDialogOpen} />
    </div>
  );
};
