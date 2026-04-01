import { CmsShell } from "@/components/layouts/cms-shell";
import { settingsSections } from "@/lib/mock/design-content";

export default function CmsSettingsPage() {
  return (
    <CmsShell
      currentPath="/cms/settings"
      description="Settings are split into navigation and form blocks so they can evolve into independent modules."
      title="Settings"
    >
      <div className={`
        grid gap-6
        xl:grid-cols-[240px_1fr]
      `}>
        <aside className="xl:sticky xl:top-[calc(var(--header-height)+2rem)] xl:h-fit">
          <div className="cms-card p-3">
            {settingsSections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={`
                  mb-1 flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm transition-colors
                  last:mb-0
                  ${
                  index === 0
                    ? "bg-primary/10 text-primary"
                    : `
                      text-muted
                      hover:bg-surface hover:text-fg
                    `
                }
                `}
              >
                {section.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="space-y-6">
          <section className="cms-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-fg">General Settings</h2>
              <p className="mt-1 text-sm text-muted">Core site information and publishing defaults.</p>
            </div>
            <div className={`
              grid gap-5 p-6
              md:grid-cols-2
            `}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-fg">Site title</label>
                <input className={`
                  h-11 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                  focus:border-primary
                `} defaultValue="Chen Serif" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-fg">Domain</label>
                <input className={`
                  h-11 w-full rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
                  focus:border-primary
                `} defaultValue="chen-serif.dev" />
              </div>
              <div className={`
                space-y-2
                md:col-span-2
              `}>
                <label className="text-sm font-medium text-fg">Description</label>
                <textarea className={`
                  min-h-28 w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg outline-none
                  focus:border-primary
                `} defaultValue="Editorial blog and CMS built with a shared design system." />
              </div>
            </div>
          </section>

          <section className="cms-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-lg font-semibold text-fg">Preferences</h2>
            </div>
            <div className="space-y-0 p-6">
              {[
                ["Enable newsletter signup", "Show newsletter block on the homepage and article pages."],
                ["Show reading progress", "Display a progress indicator on article detail pages."],
                ["Email moderation alerts", "Notify editors when new comments arrive."],
              ].map(([label, desc], index) => (
                <div key={label} className={`
                  flex items-center justify-between py-5
                  ${index !== 2 ? `border-b border-border` : ""}
                `}>
                  <div className="pr-8">
                    <div className="text-sm font-medium text-fg">{label}</div>
                    <div className="mt-1 text-xs text-muted">{desc}</div>
                  </div>
                  <div className="relative h-6 w-12 rounded-full border border-primary bg-primary/20">
                    <span className={`
                      absolute top-1/2 size-5 -translate-y-1/2 rounded-full
                      ${index === 1 ? `left-1 bg-muted` : `right-1 bg-primary`}
                    `} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CmsShell>
  );
}
