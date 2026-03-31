import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ArticleSearch() {
  return (
    <div className="relative max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
      <Input className="h-12 rounded-full pl-10" placeholder="Search articles, topics, notes..." />
    </div>
  );
}
