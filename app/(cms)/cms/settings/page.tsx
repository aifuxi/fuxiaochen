import { SettingsNav } from "@/components/cms/settings-nav";
import { SiteSettingsForm } from "@/components/features/cms/settings/site-settings-form";
import { CmsShell } from "@/components/layouts/cms-shell";

const sections = [
  { id: "general", label: "General" },
  { id: "seo", label: "SEO" },
  { id: "appearance", label: "Appearance" },
] as const;

export default function CmsSettingsPage() {
  return (
    <CmsShell
      currentPath="/cms/settings"
      description="Settings are split into navigation and form blocks so they can evolve into independent modules."
      title="Settings"
    >
      <div className={`
        grid gap-6
        xl:grid-cols-[240px_1fr]
      `}>
        <SettingsNav active="general" items={[...sections]} />
        <SiteSettingsForm />
      </div>
    </CmsShell>
  );
}
