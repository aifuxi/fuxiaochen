import { PageBreadcrumb } from '@/components/page-header';

import { PATHS } from '@/constants';

import { AdminContentLayout, EditSnippetForm } from '../../components';

export const EditSnippetPage = () => {
  return (
    <AdminContentLayout
      breadcrumb={
        <PageBreadcrumb
          breadcrumbList={[
            PATHS.ADMIN_HOME,
            PATHS.ADMIN_SNIPPET,
            PATHS.ADMIN_SNIPPET_EDIT,
          ]}
        />
      }
    >
      <EditSnippetForm />
    </AdminContentLayout>
  );
};
