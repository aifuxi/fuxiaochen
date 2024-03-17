import { AdminSnippetListPage } from '@/features/admin';
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  return <AdminSnippetListPage session={session} />;
}
