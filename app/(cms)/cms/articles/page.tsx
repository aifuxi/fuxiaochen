import { ArticlesTable } from "@/components/cms/articles-table";
import { CmsShell } from "@/components/layouts/cms-shell";
import { cmsArticles } from "@/lib/mock/design-content";

export default function CmsArticlesPage() {
  return (
    <CmsShell
      currentPath="/cms/articles"
      description="Content list scaffold split into toolbar, bulk actions and table layers."
      title="Articles"
    >
      <div className="space-y-6">
        <section className="cms-card p-5">
          <div className={`
            flex flex-col gap-4
            xl:flex-row xl:items-center xl:justify-between
          `}>
            <div className="flex flex-wrap gap-3">
              <input
                className={`
                  h-10 min-w-64 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                  placeholder:text-muted
                  focus:border-primary
                `}
                placeholder="Search articles..."
              />
              <select className={`
                h-10 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                focus:border-primary
              `}>
                <option>All categories</option>
                <option>Design Systems</option>
                <option>Editorial UI</option>
                <option>CMS</option>
              </select>
              <select className={`
                h-10 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                focus:border-primary
              `}>
                <option>All status</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={`
                rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors
                hover:text-fg
              `}>
                Bulk actions
              </button>
              <button type="button" className={`
                rounded-md bg-primary px-4 py-2 font-medium text-primary-fg transition-colors
                hover:bg-primary-h
              `}>
                New article
              </button>
            </div>
          </div>
        </section>
        <ArticlesTable rows={[...cmsArticles]} />
      </div>
    </CmsShell>
  );
}
