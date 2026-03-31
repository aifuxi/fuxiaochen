import { CmsShell } from "@/components/layouts/cms-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CmsUsersPage() {
  return (
    <CmsShell
      currentPath="/cms/users"
      description="Users is scaffolded so management pages can share the same shell and data patterns."
      title="Users"
    >
      <Card>
        <CardContent className="p-0 text-sm leading-7 text-muted">
          User management should eventually reuse tables, bulk actions, dialogs
          and status badges from the shared CMS layer.
        </CardContent>
      </Card>
    </CmsShell>
  );
}
