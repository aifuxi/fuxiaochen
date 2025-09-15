import { AdminBlogListPage } from "@/features/admin";
import { noAdminPermission } from "@/features/user";

export default async function Page() {
  const status = await noAdminPermission();

  return <AdminBlogListPage isAdmin={!status} />;
}
