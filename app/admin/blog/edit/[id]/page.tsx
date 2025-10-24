import { AdminContentLayout } from "@/app/admin/components/admin-content-layout";

import { EditBlogForm } from "../../components/edit-blog-form";
import { EditBlogPageHeader } from "../../components/header";

export default function Page() {
  return (
    <AdminContentLayout header={<EditBlogPageHeader />}>
      <EditBlogForm />
    </AdminContentLayout>
  );
}
