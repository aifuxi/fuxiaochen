import { CmsChangelogForm } from "@/components/blocks/cms-changelog-form";
import { CmsShell } from "@/components/layout/cms-shell";

type CmsEditChangelogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CmsEditChangelogPage({ params }: CmsEditChangelogPageProps) {
  const { id } = await params;

  return (
    <CmsShell description="Update release metadata, ordering, and nested changelog items." title="Edit Release">
      <CmsChangelogForm releaseId={id} />
    </CmsShell>
  );
}
