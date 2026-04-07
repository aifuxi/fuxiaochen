import Link from "next/link";

import { ResourceTable } from "@/components/blocks/resource-table";
import { CmsShell } from "@/components/layout/cms-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { articleRows } from "@/lib/mocks/cms-content";

export default function CmsArticlesPage() {
  return (
    <CmsShell description="Manage article state, status, and revision flow before real persistence is connected." title="Articles">
      <div className="mb-5 flex justify-end">
        <Link className={cn(buttonVariants({ variant: "primary" }))} href="/cms/article/new">
          New Article
        </Link>
      </div>
      <ResourceTable
        columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "author", label: "Author" },
          { key: "status", label: "Status" },
          { key: "updatedAt", label: "Updated" },
        ]}
        rows={articleRows}
      />
    </CmsShell>
  );
}
