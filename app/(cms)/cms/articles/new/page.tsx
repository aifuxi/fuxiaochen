import { CmsShell } from "@/components/layouts/cms-shell";

export default function CmsArticleNewPage() {
  return (
    <CmsShell
      currentPath="/cms/articles"
      description="Static article creation screen based on the CMS design iteration."
      title="New Article"
    >
      <div className={`
        grid gap-6
        xl:grid-cols-[1fr_320px]
      `}>
        <section className="cms-card overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-semibold text-fg">Article Content</h2>
          </div>
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-fg">Title</label>
              <input className={`
                h-12 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Enter article title..." />
            </div>
            <div className={`
              grid gap-5
              md:grid-cols-2
            `}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-fg">Slug</label>
                <input className={`
                  h-12 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                  placeholder:text-muted
                  focus:border-primary
                `} placeholder="building-a-design-system" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-fg">Category</label>
                <select className={`
                  h-12 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                  focus:border-primary
                `}>
                  <option>Design Systems</option>
                  <option>Editorial UI</option>
                  <option>CMS</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-fg">Excerpt</label>
              <textarea className={`
                min-h-28 w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Short description..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-fg">Body</label>
              <textarea className={`
                min-h-[420px] w-full rounded-md border border-border bg-[rgb(255_255_255_/_0.03)] px-4 py-4 font-mono
                text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Write your article in Markdown..." />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="cms-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">Publish</h2>
            <div className="space-y-3">
              <button type="button" className={`
                h-11 w-full rounded-md bg-primary font-medium text-primary-fg transition-colors
                hover:bg-primary-h
              `}>
                Publish article
              </button>
              <button type="button" className={`
                h-11 w-full rounded-md border border-border text-sm text-muted transition-colors
                hover:text-fg
              `}>
                Save draft
              </button>
            </div>
          </section>

          <section className="cms-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">Metadata</h2>
            <div className="space-y-4">
              <input className={`
                h-11 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Cover image URL" />
              <input className={`
                h-11 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                placeholder:text-muted
                focus:border-primary
              `} placeholder="Tags: tokens, css, ui" />
              <select className={`
                h-11 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                focus:border-primary
              `}>
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
          </section>
        </aside>
      </div>
    </CmsShell>
  );
}
