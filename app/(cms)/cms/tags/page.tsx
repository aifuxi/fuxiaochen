import { CmsShell } from "@/components/layouts/cms-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CmsTagsPage() {
  return (
    <CmsShell
      currentPath="/cms/tags"
      description="Tag management is scaffolded as a first-class CMS route."
      title="Tags"
    >
      <Card>
        <CardContent className="p-0 text-sm leading-7 text-muted">
          Extract the eventual tags table into `components/cms` once real data
          flows in.
        </CardContent>
      </Card>
    </CmsShell>
  );
}
