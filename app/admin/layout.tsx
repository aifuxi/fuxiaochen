import { redirect } from 'next/navigation';

import { SideNav } from '@/components/navbar';
import { SignOutButton } from '@/components/sign-out-button';
import { SwitchTheme } from '@/components/switch-theme';

import { PATHS } from '@/constants/path';

import { auth } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(PATHS.AUTH_SIGNIN);
  }

  return (
    <div className="flex">
      <div className="min-w-[256px] max-w-[256px] h-screen bg-foreground flex-col flex items-center p-2 gap-2">
        {session?.user?.image && (
          <img
            src={session?.user?.image}
            className="border w-[200px] h-[200px]  my-6 rounded-lg"
            alt={session?.user?.name ?? ''}
          />
        )}

        <div className="w-full flex-1 flex-col flex items-center">
          <SideNav />
        </div>

        <SignOutButton />
      </div>
      <div className="h-screen overflow-scroll flex flex-1 p-8 flex-col">
        {children}
      </div>

      <div className="fixed w-12 h-12 grid place-content-center right-12 top-6">
        <SwitchTheme variant={'outline'} />
      </div>
    </div>
  );
}
