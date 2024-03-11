import { SnippetList, getPublishedSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets } = await getPublishedSnippets();

  return (
    <div className="w-full flex flex-col justify-center max-w-screen-md mx-auto pt-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-9">Snippets</h2>

      <SnippetList snippets={snippets} />
    </div>
  );
}
