"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", "border-border", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        `
          [&>tr]:last-child:border-b-0
          border-t border-border bg-surface font-medium
        `,
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        `
          border-b border-border transition-colors duration-200
          hover:bg-surface-hover
          data-[state=selected]:bg-accent/10
        `,
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        `
          sticky h-10 bg-surface px-2 text-left align-middle font-medium whitespace-nowrap text-text-secondary
          [&:has([role=checkbox])]:pr-0
          [&>[role=checkbox]]:translate-y-[2px]
          [&[data-pinned=left]]:left-0
          [&[data-pinned=right]]:right-0 [&[data-pinned=right]]:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]
        `,
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        `
          sticky bg-surface p-2 align-middle whitespace-nowrap
          [&:has([role=checkbox])]:pr-0
          [&>[role=checkbox]]:translate-y-[2px]
          [&[data-pinned=left]]:left-0
          [&[data-pinned=right]]:right-0 [&[data-pinned=right]]:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]
        `,
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-text-tertiary", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
