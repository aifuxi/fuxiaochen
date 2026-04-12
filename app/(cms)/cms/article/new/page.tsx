import { CmsArticleForm } from "@/components/blocks/cms-article-form";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsNewArticlePage() {
  return (
    <CmsShell description="通过分类、状态和 SEO 元数据向实时内容 API 写入和发布文章。" title="创建文章">
      <CmsArticleForm />
    </CmsShell>
  );
}
