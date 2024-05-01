import { SnippetList, getPublishedSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets, uvMap } = await getPublishedSnippets();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md 2xl:max-w-6xl md:px-0 md:mx-auto pb-24 pt-8">
      <h2 className="text-3xl md:text-4xl font-bold pb-8">片段</h2>

      <SnippetList snippets={snippets} uvMap={uvMap} />
    </div>
  );
}
