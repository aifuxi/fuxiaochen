import { PageHero } from "@/components/shared/page-hero";
import { ReleaseEntry } from "@/components/site/release-entry";

const releases = [
  {
    version: "v0.1.0",
    status: "live" as const,
    summary: "Added route-group scaffold for site, CMS auth and CMS shell.",
  },
  {
    version: "v0.2.0",
    status: "planned" as const,
    summary: "Promote placeholder surfaces into full production pages backed by real data.",
  },
] as const;

export default function ChangelogPage() {
  return (
    <div className={`
      container-shell space-y-10 py-10
      md:py-14
    `}>
      <PageHero
        badge="Changelog"
        eyebrow="Timeline"
        title="Release notes are now a first-class route."
        description="The public route is in place and mapped to a dedicated release entry component instead of one-off timeline markup."
      />
      <div className="space-y-5">
        {releases.map((release) => (
          <ReleaseEntry key={release.version} {...release} />
        ))}
      </div>
    </div>
  );
}
