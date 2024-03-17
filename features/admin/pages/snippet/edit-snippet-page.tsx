import { PageHeader } from '@/components/page-header';

import { PATHS } from '@/constants';

import { AdminContentLayout, EditSnippetForm } from '../../components';

export const EditSnippetPage = () => {
  return (
    <AdminContentLayout
      pageHeader={
        <PageHeader
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
