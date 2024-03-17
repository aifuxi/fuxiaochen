import { PageHeader } from '@/components/page-header';

import { PATHS } from '@/constants';

import { AdminContentLayout, CreateSnippetForm } from '../../components';

export const CreateSnippetPage = () => {
  return (
    <AdminContentLayout
      pageHeader={
        <PageHeader
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
