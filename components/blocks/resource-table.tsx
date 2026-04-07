import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";

type ResourceTableProps<T extends Record<string, unknown>> = {
  columns: Array<{
    key: keyof T;
    label: string;
  }>;
  rows: T[];
};

function renderValue(value: unknown) {
  if (typeof value === "string") {
    if (["Published", "Draft", "Scheduled", "Pending", "Approved", "Spam", "Active", "Invited"].includes(value)) {
      const variant =
        value === "Published" || value === "Approved" || value === "Active"
          ? "success"
          : value === "Draft" || value === "Pending" || value === "Scheduled" || value === "Invited"
            ? "warning"
            : "destructive";

      return <Badge variant={variant}>{value}</Badge>;
    }

    return value;
  }

  return String(value);
}

export function ResourceTable<T extends Record<string, unknown>>({ columns, rows }: ResourceTableProps<T>) {
  return (
    <Table>
      <TableRoot>
        <TableHead>
          <tr>
            {columns.map((column) => (
              <TableHeaderCell key={String(column.key)}>{column.label}</TableHeaderCell>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>{renderValue(row[column.key])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </Table>
  );
}
