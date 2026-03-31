import { Badge } from "@/components/ui/badge";

const variants = {
  draft: "warning",
  live: "success",
  planned: "info",
} as const;

export function StatusBadge({
  status,
}: {
  status: keyof typeof variants;
}) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
