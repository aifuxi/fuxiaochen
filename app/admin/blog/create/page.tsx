import { AdminContentLayout } from "@/app/admin/components/admin-content-layout";

import { CreateBlogForm } from "../components/create-blog-form";
import { CreateBlogPageHeader } from "../components/header";

export default function Page() {
  return (
    <AdminContentLayout header={<CreateBlogPageHeader />}>
      <CreateBlogForm />
    </AdminContentLayout>
  );
}
