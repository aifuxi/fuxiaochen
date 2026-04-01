import { ReleaseEntry } from "@/components/site/release-entry";
import { releases } from "@/lib/mock/design-content";

export default function ChangelogPage() {
  return (
    <div className={`
      container-shell space-y-10 py-8
      md:py-12
    `}>
      <section className="space-y-5 py-8">
        <div className="flex items-center gap-3">
          <div className="hero-label-dot" />
          <span className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
            Changelog
          </span>
        </div>
        <h1 className="font-serif leading-[0.94] font-medium tracking-[-0.05em] text-[var(--text-h1)]">
          Product changes, refinements and system-level shifts.
        </h1>
        <p className="max-w-2xl text-lg leading-9 text-muted">
          时间线结构保持和原型一致，强调版本标签、变更类型和垂直节奏。
        </p>
      </section>
      <div className="space-y-8">
        {releases.map((release) => (
          <ReleaseEntry key={release.version} {...release} />
        ))}
      </div>
    </div>
  );
}
