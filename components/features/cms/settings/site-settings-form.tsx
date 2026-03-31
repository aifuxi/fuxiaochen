import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteSettingsForm() {
  return (
    <form className="space-y-6 rounded-xl border border-border bg-card/90 p-6">
      <div className={`
        grid gap-5
        md:grid-cols-2
      `}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Site title</label>
          <Input defaultValue="Chen Serif" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary domain</label>
          <Input defaultValue="chen-serif.dev" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input defaultValue="Editorial blog and CMS built with a shared design system." />
      </div>
      <Button type="submit">Save Settings</Button>
    </form>
  );
}
