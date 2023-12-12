import { SideNav } from '@/components/navbar';
import { SignOutButton } from '@/components/sign-out-button';
import { PLACEHOLDER_COVER } from '@/constants/unknown';
import { auth } from '@/libs/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex">
      <div className="min-w-[256px] max-w-[256px] h-screen bg-foreground flex-col flex items-center p-2 gap-2">
        <img
          src={session?.user?.image ?? PLACEHOLDER_COVER}
          className="border w-[200px] h-[200px]  my-6"
          alt={session?.user?.name ?? ''}
        />

        <div className="w-full flex-1 flex-col flex items-center">
          <SideNav />
        </div>

        <SignOutButton />
      </div>
      <div className="h-screen overflow-scroll flex flex-1 p-8 flex-col">
        {children}
      </div>
    </div>
  );
}
