import { PATHS } from '@/config';

import { PageHeader } from '@/components/page-header';

import { SnippetList, getSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets } = await getSnippets();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md 2xl:max-w-6xl md:px-0 md:mx-auto pb-24 pt-8">
      <PageHeader
        breadcrumbList={[PATHS.SITE_HOME, PATHS.SITE_SNIPPET]}
        className="mb-9"
      />

      <SnippetList snippets={snippets} />
    </div>
  );
}
