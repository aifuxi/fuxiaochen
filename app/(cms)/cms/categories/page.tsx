import { CmsShell } from "@/components/layouts/cms-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CmsCategoriesPage() {
  return (
    <CmsShell
      currentPath="/cms/categories"
      description="Taxonomy pages are present so the route map now matches the design spec."
      title="Categories"
    >
      <Card>
        <CardContent className="p-0 text-sm leading-7 text-muted">
          Category management will follow the same table + toolbar pattern as
          articles, but with taxonomy-specific actions.
        </CardContent>
      </Card>
    </CmsShell>
  );
}
