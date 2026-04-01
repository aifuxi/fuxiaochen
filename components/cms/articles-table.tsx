import { MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ArticlesTable({
  rows,
}: {
  rows: Array<{
    title: string;
    category: string;
    author: string;
    status: "published" | "draft" | "archived";
    date: string;
    views: string;
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-border bg-card/90">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <span className="block size-[18px] rounded-[4px] border border-border" />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Views</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.title}>
              <TableCell>
                <span className={`
                  block size-[18px] rounded-[4px] border border-border transition-colors
                  hover:border-primary
                `} />
              </TableCell>
              <TableCell className="font-medium text-fg">{row.title}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.author}</TableCell>
              <TableCell>
                <span
                  className={`
                    inline-flex rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase
                    ${
                    row.status === "published"
                      ? "bg-primary/12 text-primary"
                      : row.status === "draft"
                        ? "bg-warning/12 text-warning"
                        : "bg-white/10 text-muted"
                  }
                  `}
                >
                  {row.status}
                </span>
              </TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.views}</TableCell>
              <TableCell>
                <button
                  type="button"
                  className={`
                    flex size-8 items-center justify-center rounded-md text-muted transition-colors
                    hover:bg-surface hover:text-fg
                  `}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
