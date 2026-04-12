import { CmsChangelogManager } from "@/components/blocks/cms-changelog-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsChangelogPage() {
  return (
    <CmsShell description="管理版本历史、更新明细和版本节奏，对抗实时更新日志 API。" title="更新日志">
      <CmsChangelogManager />
    </CmsShell>
  );
}
