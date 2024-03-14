import { PATHS } from '@/config';

import { PageHeader } from '@/components/page-header';

import { CreateBlogForm } from '../../components';

export const CreateBlogPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        breadcrumbList={[
          PATHS.ADMIN_HOME,
          PATHS.ADMIN_BLOG,
          PATHS.ADMIN_BLOG_CREATE,
        ]}
      />

      <CreateBlogForm />
    </div>
  );
};
