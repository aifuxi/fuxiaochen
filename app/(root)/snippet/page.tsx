import { SnippetList, getPublishedSnippets } from "@/features/snippet";

export const revalidate = 60;

export default async function Page() {
  const { snippets } = await getPublishedSnippets();

  return (
    <div className="mx-auto flex min-h-screen max-w-wrapper flex-col px-6 pt-8 pb-24">
      <h2
        className={`
          pb-8 text-3xl font-bold
          md:text-4xl
        `}
      >
        最新片段
      </h2>

      <SnippetList snippets={snippets} />
    </div>
  );
}
