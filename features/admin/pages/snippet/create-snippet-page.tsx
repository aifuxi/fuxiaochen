import { PageHeader } from '@/components/page-header';

import { PATHS } from '@/constants';

import { AdminAnimatePage, CreateSnippetForm } from '../../components';

export const CreateSnippetPage = () => {
  return (
    <AdminAnimatePage className="flex flex-col gap-4">
      <PageHeader
        breadcrumbList={[
          PATHS.ADMIN_HOME,
          PATHS.ADMIN_SNIPPET,
          PATHS.ADMIN_SNIPPET_CREATE,
        ]}
      />

      <CreateSnippetForm />
    </AdminAnimatePage>
  );
};
