import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/table";

test("Card renders the shared surface token", () => {
  const html = renderToStaticMarkup(<Card />);

  expect(html).toContain("bg-[color:var(--color-surface-1)]");
  expect(html).not.toContain("bg-white/3");
  expect(html).not.toContain("bg-white/4");
});

test("Table renders the shared surface token", () => {
  const html = renderToStaticMarkup(
    <Table>
      <TableRoot>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Heading</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </TableRoot>
    </Table>,
  );

  expect(html).toContain("bg-[color:var(--color-surface-1)]");
  expect(html).not.toContain("bg-white/3");
  expect(html).not.toContain("bg-white/4");
});
