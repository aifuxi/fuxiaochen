import { Button } from "@/components/ui/button";

export function BulkActions() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/90 p-4">
      <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
        Bulk actions
      </div>
      <Button size="sm" variant="secondary">
        Publish
      </Button>
      <Button size="sm" variant="outline">
        Archive
      </Button>
      <Button size="sm" variant="destructive">
        Delete
      </Button>
    </div>
  );
}
