import { cn } from "@/lib/utils";

type CmsSettingsNavProps = {
  activeSection: string;
  onSectionChange?: (section: string) => void;
  sections: readonly string[];
};

export function CmsSettingsNav({
  activeSection,
  onSectionChange,
  sections,
}: CmsSettingsNavProps) {
  return (
    <nav
      aria-label="设置章节"
      className={`
        rounded-2xl border
        border-[color:var(--color-line-default)]
        bg-[color:var(--color-surface-1)]
        p-4
      `}
    >
      <div className="font-mono-tech mb-4 text-[11px] tracking-[0.24em] text-muted uppercase">
        Sections
      </div>
      <ol className="space-y-2">
        {sections.map((section) => {
          const isActive = activeSection === section;

          return (
            <li key={section} data-section={section}>
              <button
                className={cn(
                  `
                    flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
                  `,
                  isActive
                    ? `
                      border-[color:var(--color-line-default)]
                      bg-[color:var(--color-surface-2)]
                      text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
                    `
                    : `
                      border-transparent bg-transparent text-muted
                      hover:border-[color:var(--color-line-default)] hover:bg-[color:var(--color-surface-2)]
                      hover:text-foreground
                    `,
                )}
                type="button"
                aria-current={isActive ? "page" : undefined}
                aria-label={`设置章节：${section}`}
                onClick={() => onSectionChange?.(section)}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-2xl border text-xs font-semibold tracking-[0.18em]",
                    isActive
                      ? `
                        border-[color:var(--color-line-default)]
                        bg-[color:var(--color-surface-1)]
                        text-primary
                      `
                      : `
                        border-[color:var(--color-line-default)]
                        bg-[color:var(--color-surface-1)]
                        text-muted
                      `,
                  )}
                >
                  {section.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-left font-medium">{section}</span>
                  <span className="font-mono-tech mt-1 block text-[10px] tracking-[0.24em] text-muted uppercase">
                    Section
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
