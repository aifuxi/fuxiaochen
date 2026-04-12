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
    <CmsShell description="更新文章内容、分类、发布状态和 SEO 元数据。" title="编辑文章">
      <CmsArticleForm articleId={id} />
    </CmsShell>
  );
}
