import { notFound } from "next/navigation";

import { MarkdownViewer } from "@/components/editor/markdown-viewer";
import { TocNav } from "@/components/blocks/toc-nav";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { extractToc } from "@/lib/markdown";
import { articles } from "@/lib/mocks/site-content";

type ArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const toc = extractToc(article.markdown);

  return (
    <div className="shell-container-lg">
      <section className={`
        mb-10 grid gap-8
        lg:grid-cols-[1fr_18rem]
      `}>
        <div className="space-y-6 rounded-[2rem] border border-white/8 bg-white/3 p-8">
          <Badge className="w-fit" variant="primary">
            {article.category}
          </Badge>
          <div className="space-y-4">
            <h1 className="font-serif text-7xl tracking-[-0.07em] text-balance">{article.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
          </div>
          <div className={`
            flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-3
          `}>
            <Avatar alt="Fuxiaochen" fallback="FC" />
            <div>
              <div className="text-sm font-medium">Fuxiaochen</div>
              <div className="text-xs text-muted">
                {article.date} · {article.readTime}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:pt-10">
          <TocNav items={toc} />
        </div>
      </section>

      <article className="rounded-[2rem] border border-white/8 bg-white/3 p-8">
        <div className="prose-chen">
          <MarkdownViewer value={article.markdown} />
        </div>
      </article>
    </div>
  );
}
