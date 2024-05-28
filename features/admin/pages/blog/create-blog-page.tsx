import { PageBreadcrumb } from "@/components/page-header";

import { PATHS } from "@/constants";

import { AdminContentLayout, CreateBlogForm } from "../../components";

export const CreateBlogPage = () => {
  return (
    <AdminContentLayout
      breadcrumb={
        <PageBreadcrumb
          breadcrumbList={[
            PATHS.ADMIN_HOME,
            PATHS.ADMIN_BLOG,
            PATHS.ADMIN_BLOG_CREATE,
          ]}
        />
      }
    >
      <CreateBlogForm />
    </AdminContentLayout>
  );
};
