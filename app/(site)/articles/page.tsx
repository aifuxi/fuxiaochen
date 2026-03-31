import { ArticleSearch } from "@/components/features/articles/article-search";
import { PageHero } from "@/components/shared/page-hero";
import { ArticleCard } from "@/components/site/article-card";

const articles = [
  {
    href: "/articles/design-tokens-at-scale",
    category: "Design System",
    title: "Design Tokens At Scale",
    excerpt: "Shared semantic tokens for content-heavy public pages and higher-density admin views.",
    meta: "8 min read",
  },
  {
    href: "/articles/routing-the-editorial-system",
    category: "Architecture",
    title: "Routing The Editorial System",
    excerpt: "Scaffolded with route groups so future implementation can stay isolated and predictable.",
    meta: "6 min read",
  },
  {
    href: "/articles/variant-driven-cms-ui",
    category: "Variants",
    title: "Variant Driven CMS UI",
    excerpt: "Buttons, cards and badges are now aligned with CVA-based visual intent instead of page-local styling.",
    meta: "7 min read",
  },
] as const;

export default function ArticlesPage() {
  return (
    <div className={`
      container-shell space-y-10 py-10
      md:py-14
    `}>
      <PageHero
        badge="Archive"
        eyebrow="Articles"
        title="Editorial archive scaffold"
        description="Search, filtering and pagination are split into feature and shared layers rather than embedded in a single page."
      />
      <ArticleSearch />
      <div className={`
        grid gap-6
        lg:grid-cols-3
      `}>
        {articles.map((article) => (
          <ArticleCard key={article.href} {...article} />
        ))}
      </div>
    </div>
  );
}
