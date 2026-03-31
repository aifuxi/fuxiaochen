import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent } from "@/components/ui/card";

export default function ArticleDetailPage() {
  return (
    <div className={`
      container-shell space-y-10 py-10
      md:py-14
    `}>
      <PageHero
        badge="Article Detail"
        eyebrow="Longform"
        title="Article routes now live under `/articles/[slug]`."
        description="This page is intentionally scaffold-level. The route is in place, the shell is shared, and the next step is moving article prose, TOC and meta into reusable site components."
      />
      <Card>
        <CardContent className="max-w-3xl space-y-6 p-0">
          <p className="prose-muted">
            The design spec calls for a structured article detail view with hero,
            author meta, prose container, table of contents and related content.
            This route establishes the path and page shell without hardcoding that
            implementation into a one-off page.
          </p>
          <p className="prose-muted">
            When real content arrives, the next components to extract are
            `article-prose`, `author-meta`, `toc-nav` and `related-articles`.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
