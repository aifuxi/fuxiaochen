import { SectionHeader } from "@/components/shared/section-header";
import { PageHero } from "@/components/shared/page-hero";
import { ArticleCard } from "@/components/site/article-card";
import { ProjectCard } from "@/components/site/project-card";

const articles = [
  {
    href: "/articles/design-tokens-at-scale",
    category: "Design System",
    title: "Design Tokens At Scale",
    excerpt: "How the public site and CMS share one visual language without sharing one page density.",
    meta: "8 min read",
  },
  {
    href: "/articles/routing-the-editorial-system",
    category: "Next.js",
    title: "Routing The Editorial System",
    excerpt: "Using route groups to keep public, auth and CMS shells isolated without fragmenting the app.",
    meta: "6 min read",
  },
] as const;

const projects = [
  {
    title: "Chen Serif Site",
    description: "Editorial homepage, archive, article detail and design documentation powered by shared primitives.",
    stack: ["Next.js", "Tailwind v4", "Radix"],
  },
  {
    title: "Chen CMS",
    description: "Operations shell for publishing workflows, taxonomy management and analytics surfaces.",
    stack: ["Prisma", "Better Auth", "NiceModal"],
  },
] as const;

export default function HomePage() {
  return (
    <div className={`
      container-shell space-y-16 py-10
      md:space-y-24 md:py-14
    `}>
      <PageHero
        badge="Site Group"
        eyebrow="Editorial System"
        title="Public site and CMS now share one scaffold."
        description="This root page is moved into the new `(site)` route group, with shared layout shells and domain component layers ready for real implementation."
      />

      <section className="space-y-8">
        <SectionHeader
          eyebrow="Articles"
          title="Public content patterns"
          description="These cards mark the first reusable site-level components instead of page-local markup."
        />
        <div className={`
          grid gap-6
          lg:grid-cols-2
        `}>
          {articles.map((article) => (
            <ArticleCard key={article.href} {...article} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeader
          eyebrow="Projects"
          title="Business components are split by domain."
          description="Public site cards now live under `components/site`, while CMS widgets live under `components/cms` and `components/features`."
        />
        <div className={`
          grid gap-6
          lg:grid-cols-2
        `}>
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>
    </div>
  );
}
