import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return <table className={cn("ds-table", className)} {...props} />;
}
export function TableHeader(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}
export function TableBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}
export function TableRow(props: ComponentProps<"tr">) {
  return <tr {...props} />;
}
export function TableHead({ scope = "col", ...props }: ComponentProps<"th">) {
  return <th scope={scope} {...props} />;
}
export function TableCell(props: ComponentProps<"td">) {
  return <td {...props} />;
}
export function TableCaption(props: ComponentProps<"caption">) {
  return <caption {...props} />;
}
