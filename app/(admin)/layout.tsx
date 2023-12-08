import { redirect } from 'next/navigation';

import { PageLoading } from '@/components/loading';
import { SideNav } from '@/components/navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { PATHS } from '@/constants/path';
import { auth } from '@/libs/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect(PATHS.AUTH_SIGN_IN);
  }

  return (
    <div className="flex">
      <div className="min-w-[256px] max-w-[256px] h-screen bg-foreground flex-col flex items-center p-2 gap-2">
        {session?.user?.image ? (
          <img
            src={session?.user?.image}
            className="border w-[200px] h-[200px]  my-6"
            alt={session?.user?.name ?? ''}
          />
        ) : (
          <Skeleton className="w-[200px] h-[200px] my-6" />
        )}

        <SideNav />
      </div>
      <div className="h-screen overflow-scroll flex flex-1 p-8 flex-col">
        {renderChildren()}
      </div>
    </div>
  );

  function renderChildren() {
    if (status === 'loading') {
      return <PageLoading />;
    }

    return children;
  }
}
