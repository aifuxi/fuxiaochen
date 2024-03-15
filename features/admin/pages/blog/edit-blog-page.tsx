import { PageHeader } from '@/components/page-header';

import { PATHS } from '@/constants';

import { EditBlogForm } from '../../components';

export const EditBlogPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        breadcrumbList={[
          PATHS.ADMIN_HOME,
          PATHS.ADMIN_BLOG,
          PATHS.ADMIN_BLOG_EDIT,
        ]}
      />

      <EditBlogForm />
    </div>
  );
};
