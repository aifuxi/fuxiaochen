import { SettingsPanel } from "@/components/blocks/settings-panel";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsSettingsPage() {
  return (
    <CmsShell description="Workspace preferences, autosave behavior, and notification defaults." title="Settings">
      <SettingsPanel />
    </CmsShell>
  );
}
