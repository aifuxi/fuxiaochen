import { cn } from "@/lib/utils";

export function SettingsNav({
  active,
  items,
}: {
  active: string;
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/90 p-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-md px-4 py-3 text-sm transition-colors",
            active === item.id
              ? "bg-primary/12 text-primary"
              : `
                text-muted
                hover:bg-surface hover:text-fg
              `,
          )}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
