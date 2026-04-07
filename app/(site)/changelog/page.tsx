import { changelogEntries } from "@/lib/mocks/site-content";

const legend = [
  { label: "Added", tone: "text-primary-accent" },
  { label: "Improved", tone: "text-sky-400" },
  { label: "Fixed", tone: "text-amber-400" },
  { label: "Changed", tone: "text-red-400" },
];

export default function ChangelogPage() {
  return (
    <div>
      <section className="relative px-8 pt-32 pb-16">
        <div className="mx-auto max-w-4xl">
          <span className="font-mono-tech text-primary-accent mb-4 block text-xs tracking-widest uppercase">Updates</span>
          <h1 className={`
            font-serif text-5xl tracking-tighter
            lg:text-6xl
          `} style={{ lineHeight: 0.95 }}>
            Changelog
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed font-light text-muted">
            A record of all major updates, improvements, and fixes. Stay up to date with the latest changes.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`
                  rounded-full bg-white/6 px-3 py-1 text-xs font-medium
                  ${item.tone}
                `}>{item.label}</span>
                <span className="text-sm text-muted">{item.label === "Added" ? "New features" : item.label === "Improved" ? "Enhancements" : item.label === "Fixed" ? "Bug fixes" : "Breaking changes"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 pb-32">
        <div className="mx-auto max-w-4xl space-y-12">
          {changelogEntries.map((entry, index) => (
            <div key={entry.version} className="glass-card rounded-2xl border border-white/10 p-8">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <span className={`
                  rounded-full px-4 py-2 text-sm font-bold
                  ${index === 0 ? "bg-primary text-black" : `bg-white/6 text-foreground`}
                `}>{entry.version}</span>
                <span className="text-sm text-muted">{entry.date}</span>
                <span className="text-sm font-medium">{entry.title}</span>
              </div>
              <p className="mb-6 leading-relaxed font-light text-muted">{entry.title}</p>
              <div className="space-y-3">
                {entry.changes.map((change, changeIndex) => (
                  <div key={change} className="flex items-start gap-3">
                    <span className={`
                      mt-0.5 rounded-full px-3 py-1 text-xs
                      ${changeIndex % 4 === 0 ? "text-primary-accent bg-primary/20" : changeIndex % 4 === 1 ? `
                        bg-sky-500/20 text-sky-400
                      ` : changeIndex % 4 === 2 ? `bg-amber-500/20 text-amber-400` : `bg-red-500/20 text-red-400`}
                    `}>
                      {changeIndex % 4 === 0 ? "Added" : changeIndex % 4 === 1 ? "Improved" : changeIndex % 4 === 2 ? "Fixed" : "Changed"}
                    </span>
                    <div>
                      <span className="font-medium">{change}</span>
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
