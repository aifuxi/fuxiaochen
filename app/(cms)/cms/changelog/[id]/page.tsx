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
    <CmsShell description="更新版本元数据、排序和嵌套的更新日志条目。" title="编辑版本">
      <CmsChangelogForm releaseId={id} />
    </CmsShell>
  );
}
