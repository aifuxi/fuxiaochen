import Link from "next/link";

import { getPublicTaxonomies } from "@/lib/public/service";
export const metadata = { title: "分类" };
export default async function CategoriesPage() {
  const { categories } = await getPublicTaxonomies();
  return (
    <main id="main-content" className="site-main">
      <header className="site-page-heading">
        <h1>分类</h1>
        <p>按主题探索文章。</p>
      </header>
      {categories.length ? (
        <div className="site-taxonomy-list">
          {categories.map((c) => (
            <Link key={c.id} href={`/?categoryId=${c.id}`}>
              <span>{c.name}</span>
              <span>{c.count} 篇</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="site-empty">还没有包含已发布文章的分类。</p>
      )}
    </main>
  );
}
