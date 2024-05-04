import { PageBreadcrumb } from '@/components/page-header';

import { PATHS } from '@/constants';

import { AdminContentLayout, CreateSnippetForm } from '../../components';

export const CreateSnippetPage = () => {
  return (
    <AdminContentLayout
      breadcrumb={
        <PageBreadcrumb
          breadcrumbList={[
            PATHS.ADMIN_HOME,
            PATHS.ADMIN_SNIPPET,
            PATHS.ADMIN_SNIPPET_CREATE,
          ]}
        />
      }
    >
      <CreateSnippetForm />
    </AdminContentLayout>
  );
};
