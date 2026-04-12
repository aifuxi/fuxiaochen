import { CmsChangelogForm } from "@/components/blocks/cms-changelog-form";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsNewChangelogPage() {
  return (
    <CmsShell description="创建带有嵌套更新条目和版本元数据的更新日志版本。" title="创建版本">
      <CmsChangelogForm />
    </CmsShell>
  );
}
