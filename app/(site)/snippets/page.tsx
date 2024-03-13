import { PATHS, PATHS_MAP } from '@/config';

import { SnippetList, getSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets } = await getSnippets();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md 2xl:max-w-6xl md:px-0 md:mx-auto py-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-9">
        {PATHS_MAP[PATHS.SITE_SNIPPETS]}
      </h2>

      <SnippetList snippets={snippets} />
    </div>
  );
}
