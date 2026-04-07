import { ArticleEditorShell } from "@/components/blocks/article-editor-shell";
import { CmsShell } from "@/components/layout/cms-shell";
import { articles } from "@/lib/mocks/site-content";

export default function CmsNewArticlePage() {
  return (
    <CmsShell description="A ByteMD-based authoring surface wrapped in the same component system as the rest of the CMS." title="Create Article">
      <div className={`
        grid gap-6
        xl:grid-cols-[1fr_320px]
      `}>
        <div className="space-y-6">
          <div className="glass-card overflow-hidden rounded-2xl border border-white/8">
            <div className="border-b border-white/8 px-6 py-4 text-sm font-semibold">Title & Cover</div>
            <div className="p-6">
              <input className={`
                w-full border-none bg-transparent py-4 font-serif text-5xl outline-none
                placeholder:text-muted
              `} placeholder="Untitled article" />
              <div className="mt-6 rounded-2xl border-2 border-dashed border-white/10 p-10 text-center">
                <div className="mb-3 text-4xl text-muted">⌂</div>
                <div className="text-sm text-muted">
                  <span className="text-primary">Click to upload</span> or drag and drop cover image
                </div>
              </div>
            </div>
          </div>
          <ArticleEditorShell initialValue={articles[0].markdown} />
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-2xl border border-white/8 p-6">
            <div className="text-primary-accent mb-4 flex items-center gap-2">
              <span>●</span>
              <span className="text-sm font-medium">Draft saved automatically</span>
            </div>
            <div className="space-y-3">
              <button className="btn-primary-glow w-full rounded-xl px-4 py-3 font-semibold">Publish Article</button>
              <button className={`
                w-full rounded-xl border border-white/10 px-4 py-3 text-sm transition
                hover:bg-white/6
              `}>Save Draft</button>
              <button className={`
                w-full rounded-xl px-4 py-3 text-sm text-muted transition
                hover:bg-white/6 hover:text-foreground
              `}>Preview</button>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-white/8 p-6">
            <div className="mb-4 text-sm font-semibold">Post Settings</div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select className="select-dropdown w-full rounded-xl px-4 py-3 text-sm text-white">
                  <option>Design Systems</option>
                  <option>React</option>
                  <option>Typography</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select className="select-dropdown w-full rounded-xl px-4 py-3 text-sm text-white">
                  <option>Draft</option>
                  <option>Review</option>
                  <option>Published</option>
                </select>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </CmsShell>
  );
}
