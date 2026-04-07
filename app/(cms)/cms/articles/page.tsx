import Link from "next/link";

import { ResourceTable } from "@/components/blocks/resource-table";
import { CmsShell } from "@/components/layout/cms-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { articleRows } from "@/lib/mocks/cms-content";

export default function CmsArticlesPage() {
  return (
    <CmsShell description="Manage article state, status, and revision flow before real persistence is connected." title="Articles">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-sm text-foreground">All Status</button>
          <button className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-sm text-foreground">Newest</button>
        </div>
        <Link className={cn(buttonVariants({ variant: "primary" }))} href="/cms/article/new">
          New Article
        </Link>
      </div>
      <div className="glass-card rounded-2xl border border-white/8 p-4">
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
      </div>
    </CmsShell>
  );
}
