import type { Metadata } from "next";

import Link from "next/link";

import { CategoryDot } from "@/components/frontend/category-dot";
import { getPublicTaxonomies } from "@/lib/public/service";
import { pageMetadata } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return pageMetadata(settings, {
    title: "分类",
    description: `浏览 ${settings.title} 的文章分类，按主题探索已发布的内容。`,
    path: "/categories",
  });
}
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
            <Link key={c.id} href={`/posts?categoryId=${c.id}`}>
              <span className="site-category-label">
                <CategoryDot color={c.color} />
                <span className="min-w-0">{c.name}</span>
              </span>
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
