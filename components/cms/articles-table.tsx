import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ArticlesTable({
  rows,
}: {
  rows: Array<{
    title: string;
    category: string;
    author: string;
    status: "draft" | "live" | "planned";
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/90">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.title}>
              <TableCell className="font-medium">{row.title}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.author}</TableCell>
              <TableCell>
                <StatusBadge status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
