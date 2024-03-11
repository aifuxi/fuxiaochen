import { SnippetList, getSnippets } from '@/features/snippet';

export const revalidate = 60;

export default async function Page() {
  const { snippets } = await getSnippets();

  return (
    <div className="w-full flex flex-col justify-center max-w-screen-md mx-auto py-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-9">Snippets</h2>

      <SnippetList snippets={snippets} />
    </div>
  );
}
