import { CmsShell } from "@/components/layouts/cms-shell";
import { StatsGrid } from "@/components/cms/stats-grid";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Published", value: "128", detail: "live articles and changelog entries" },
  { label: "Drafts", value: "19", detail: "queued for review and publishing" },
  { label: "Comments", value: "342", detail: "pending moderation and resolution" },
  { label: "Monthly views", value: "42k", detail: "tracked across site and docs" },
] as const;

export default function CmsDashboardPage() {
  return (
    <CmsShell
      currentPath="/cms/dashboard"
      description="Shared admin shell for metrics, operational surfaces and quick publishing flows."
      title="Dashboard"
    >
      <div className="space-y-6">
        <StatsGrid items={[...stats]} />
        <div className={`
          grid gap-6
          xl:grid-cols-[1.3fr_0.9fr]
        `}>
          <Card>
            <CardContent className="space-y-3 p-0">
              <h2 className="font-serif text-3xl font-semibold tracking-[-0.04em]">
                Recent activity
              </h2>
              <p className="text-sm leading-7 text-muted">
                Activity feeds, drafts and editorial review blocks should land
                here as domain-specific CMS components.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-0">
              <h2 className="font-serif text-3xl font-semibold tracking-[-0.04em]">
                Quick actions
              </h2>
              <p className="text-sm leading-7 text-muted">
                New article, taxonomy changes and moderation queues will use this
                surface as a reusable operations block.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CmsShell>
  );
}
