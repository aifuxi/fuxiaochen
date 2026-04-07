import { CmsShell } from "@/components/layout/cms-shell";

const sections = ["General", "Appearance", "SEO", "Comments", "Integrations", "Security"];

export default function CmsSettingsPage() {
  return (
    <CmsShell description="Core workspace preferences, appearance, SEO, and moderation defaults." title="Settings">
      <div className={`
        grid gap-8
        xl:grid-cols-[240px_1fr]
      `}>
        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <div className="glass-card rounded-2xl border border-white/8 p-3">
            {sections.map((section, index) => (
              <button key={section} className={index === 0 ? `
                mb-1 flex w-full items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary
              ` : `
                mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted transition
                hover:bg-white/6 hover:text-foreground
              `}>
                <span>•</span>
                {section}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-8">
          <section className="glass-card overflow-hidden rounded-2xl border border-white/8">
            <div className="border-b border-white/8 px-6 py-5">
              <h2 className="text-lg font-semibold">General Settings</h2>
              <p className="mt-1 text-sm text-muted">Site identity, metadata, and default publishing information.</p>
            </div>
            <div className={`
              grid gap-6 p-6
              md:grid-cols-2
            `}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Site Name</label>
                <input className="form-input w-full rounded-xl px-4 py-3" defaultValue="SuperBlog" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Site URL</label>
                <input className="form-input w-full rounded-xl px-4 py-3" defaultValue="https://example.com" />
              </div>
              <div className={`
                space-y-2
                md:col-span-2
              `}>
                <label className="text-sm font-medium">Description</label>
                <textarea className="form-input min-h-28 w-full rounded-xl px-4 py-3">A calm editorial system for writing, publishing, and managing content.</textarea>
              </div>
            </div>
          </section>

          <section className="glass-card overflow-hidden rounded-2xl border border-white/8">
            <div className="border-b border-white/8 px-6 py-5">
              <h2 className="text-lg font-semibold">Feature Toggles</h2>
              <p className="mt-1 text-sm text-muted">Enable or disable key CMS behaviors.</p>
            </div>
            <div className="p-6">
              {[
                ["Allow comments", "Readers can comment on published articles."],
                ["Enable RSS feed", "Expose recent content through RSS."],
                ["Require moderation", "All new comments enter the moderation queue first."],
              ].map(([label, desc], index) => (
                <div key={label} className={`
                  flex items-center justify-between py-5
                  ${index < 2 ? `border-b border-white/8` : ""}
                `}>
                  <div className="mr-8">
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="mt-1 text-xs text-muted">{desc}</div>
                  </div>
                  <label className="relative h-[26px] w-12 flex-shrink-0">
                    <input className="peer sr-only" defaultChecked={index !== 1} type="checkbox" />
                    <span className={`
                      absolute inset-0 rounded-full border border-white/10 bg-white/6 transition
                      peer-checked:border-primary peer-checked:bg-primary/20
                    `} />
                    <span className={`
                      absolute top-1/2 left-[2px] h-5 w-5 -translate-y-1/2 rounded-full bg-white transition
                      peer-checked:translate-x-[22px] peer-checked:bg-primary
                    `} />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CmsShell>
  );
}
