import { CmsArticleForm } from "@/components/blocks/cms-article-form";
import { CmsShell } from "@/components/layout/cms-shell";

type CmsEditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CmsEditArticlePage({ params }: CmsEditArticlePageProps) {
  const { id } = await params;

  return (
    <CmsShell description="Update article content, taxonomy, publishing state, and SEO metadata." title="Edit Article">
      <CmsArticleForm articleId={id} />
    </CmsShell>
  );
}
