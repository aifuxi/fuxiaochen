import Link from "next/link";

import { getPublicTaxonomies } from "@/lib/public/service";
export const metadata = { title: "标签" };
export default async function TagsPage() {
  const { tags } = await getPublicTaxonomies();
  return (
    <main id="main-content" className="site-main">
      <header className="site-page-heading">
        <h1>标签</h1>
        <p>从一个关键词开始阅读。</p>
      </header>
      {tags.length ? (
        <div className="site-tag-cloud">
          {tags.map((t) => (
            <Link key={t.id} href={`/posts?tagId=${t.id}`}>
              #{t.name}
              <span>{t.count}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="site-empty">还没有包含已发布文章的标签。</p>
      )}
    </main>
  );
}
