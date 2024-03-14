import { PATHS } from '@/config';

import { PageHeader } from '@/components/page-header';

import { CreateSnippetForm } from '../../components';

export const CreateSnippetPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        breadcrumbList={[
          PATHS.ADMIN_HOME,
          PATHS.ADMIN_SNIPPET,
          PATHS.ADMIN_SNIPPET_CREATE,
        ]}
      />

      <CreateSnippetForm />
    </div>
  );
};
