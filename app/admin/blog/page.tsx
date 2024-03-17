import { AdminBlogListPage } from '@/features/admin';
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  return <AdminBlogListPage session={session} />;
}
