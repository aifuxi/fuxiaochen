import { Wrapper } from "@/components/wrapper";

import { SnippetList, getPublishedSnippets } from "@/features/snippet";

export const revalidate = 60;

export default async function Page() {
  const { snippets, uvMap } = await getPublishedSnippets();

  return (
    <Wrapper className="flex min-h-screen flex-col gap-6 px-6 pb-24 pt-8">
      <h2 className="pb-8 text-3xl font-bold md:text-4xl">最新片段</h2>

      <SnippetList snippets={snippets} uvMap={uvMap} />
    </Wrapper>
  );
}
