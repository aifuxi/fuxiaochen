import { ArticleArchive } from "@/components/blocks/article-archive";
import { PageIntro } from "@/components/blocks/page-intro";
import { articles } from "@/lib/mocks/site-content";

export default function ArticlesPage() {
  return (
    <>
      <PageIntro
        description="A mock content archive showing search, filtering, and pagination behavior on top of the Chen Serif card system."
        eyebrow="Archive"
        title="Articles, notes, and longer system essays."
      />
      <section className="shell-container">
        <ArticleArchive articles={articles} />
      </section>
    </>
  );
}
