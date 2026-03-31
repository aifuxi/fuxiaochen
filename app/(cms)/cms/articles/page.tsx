import { ArticlesTable } from "@/components/cms/articles-table";
import { BulkActions } from "@/components/features/cms/articles/bulk-actions";
import { CmsShell } from "@/components/layouts/cms-shell";

const rows = [
  {
    title: "Design Tokens At Scale",
    category: "Design System",
    author: "Fuxiao Chen",
    status: "live" as const,
  },
  {
    title: "Routing The Editorial System",
    category: "Architecture",
    author: "Fuxiao Chen",
    status: "draft" as const,
  },
  {
    title: "Variant Driven CMS UI",
    category: "Product",
    author: "Fuxiao Chen",
    status: "planned" as const,
  },
] as const;

export default function CmsArticlesPage() {
  return (
    <CmsShell
      currentPath="/cms/articles"
      description="Content list scaffold split into toolbar, bulk actions and table layers."
      title="Articles"
    >
      <div className="space-y-6">
        <BulkActions />
        <ArticlesTable rows={[...rows]} />
      </div>
    </CmsShell>
  );
}
