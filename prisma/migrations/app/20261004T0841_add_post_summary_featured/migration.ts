#!/usr/bin/env -S node
import { Migration, MigrationCLI } from "@prisma/orm-sqlite/migration";

import type { Contract as Start } from "../../snapshots/22b0ef2ff17a4f0bd9e2ca51b3eb8ae1922613fd6f04424d1fed4e75c0fa38bf/contract";
import type { Contract as End } from "../../snapshots/67dfdbdc4c2a086fbb3177c3bd28d121f09e73ce0a0b4edf0cce95aed43f42f6/contract";

import startContract from "../../snapshots/22b0ef2ff17a4f0bd9e2ca51b3eb8ae1922613fd6f04424d1fed4e75c0fa38bf/contract.json" with { type: "json" };
import endContract from "../../snapshots/67dfdbdc4c2a086fbb3177c3bd28d121f09e73ce0a0b4edf0cce95aed43f42f6/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        table: "post",
        column: {
          name: "featuredOrder",
          typeSql: "INTEGER",
          defaultSql: "DEFAULT 0",
          nullable: false,
        },
      }),
      this.addColumn({
        table: "post",
        column: {
          name: "isFeatured",
          typeSql: "INTEGER",
          defaultSql: "DEFAULT 0",
          nullable: false,
        },
      }),
      this.addColumn({
        table: "post",
        column: { name: "summary", typeSql: "TEXT", defaultSql: "DEFAULT ''", nullable: false },
      }),
    ];
  }
}

void MigrationCLI.run(import.meta.url, M);
