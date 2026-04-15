import { listPublicChangelog } from "@/lib/public/public-content-client";
import { SiteSectionHeading } from "@/components/blocks/site-section-heading";

const legend = [
  { itemType: "Added", label: "新增", tone: "text-primary-accent", bgTone: "bg-primary/20" },
  { itemType: "Improved", label: "优化", tone: "text-sky-400", bgTone: "bg-sky-500/20" },
  { itemType: "Fixed", label: "修复", tone: "text-amber-400", bgTone: "bg-amber-500/20" },
  { itemType: "Changed", label: "变更", tone: "text-red-400", bgTone: "bg-red-500/20" },
  { itemType: "Removed", label: "移除", tone: "text-zinc-400", bgTone: "bg-zinc-500/20" },
];

const itemTypeConfig = new Map(legend.map((item) => [item.itemType, item]));

export default async function ChangelogPage() {
  const changelog = await listPublicChangelog({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-14 pb-24">
      <section className="px-8 pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="按版本记录站点的变化，重点保留那些影响阅读和使用的更新。"
              eyebrow="Log / 更新日志"
              meta={`${changelog.items.length} 个版本`}
              title="更新日志"
            />
            <div className="flex flex-wrap gap-3">
              {legend.map((item) => (
                <div key={item.label} className={`
                  flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-2
                `}>
                  <span className={["text-xs tracking-[0.18em] uppercase", item.tone].join(" ")}>
                    {item.label}
                  </span>
                  <span className="text-xs text-muted">
                    {item.itemType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {changelog.items.map((entry, index) => (
            <div key={entry.version} className="glass-card rounded-[2rem] border border-white/10 p-8">
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={`
                  font-mono-tech rounded-full px-4 py-2 text-[11px] tracking-[0.22em] uppercase
                  ${index === 0 ? "bg-primary text-black" : "bg-white/6 text-foreground"}
                `}>{entry.version}</span>
                <div className="space-y-1">
                  <div className="font-serif text-2xl tracking-[-0.03em] text-foreground">{entry.title}</div>
                  <div className="font-mono-tech text-[11px] tracking-[0.18em] text-muted uppercase">{entry.date}</div>
                </div>
              </div>
              <p className="mb-6 max-w-3xl text-sm leading-7 text-muted">{entry.summary ?? entry.title}</p>
              <div className="space-y-3">
                {entry.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase",
                        itemTypeConfig.get(item.itemType)?.bgTone ?? "bg-white/10",
                        itemTypeConfig.get(item.itemType)?.tone ?? "text-muted",
                      ].join(" ")}
                    >
                      {item.itemType}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">{item.title}</span>
                      {item.description ? <p className="mt-1 text-sm leading-7 text-muted">{item.description}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
