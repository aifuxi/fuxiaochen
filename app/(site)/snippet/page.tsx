import { Wrapper } from '@/components/wrapper';

import { SnippetList, getPublishedSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets, uvMap } = await getPublishedSnippets();

  return (
    <Wrapper className="flex flex-col gap-6 min-h-screen pt-8 pb-24 px-6">
      <h2 className="text-3xl md:text-4xl font-bold pb-8">最新片段</h2>

      <SnippetList snippets={snippets} uvMap={uvMap} />
    </Wrapper>
  );
}
