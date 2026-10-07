#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, lit } from "@prisma/orm-postgres/migration";

import type { Contract as End } from "../../snapshots/2908a7712d8c234e7671488cc7e62c5552ae2f7b838a6e8788aef33ca9e2416e/contract";
import type { Contract as Start } from "../../snapshots/eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8/contract";

import endContract from "../../snapshots/2908a7712d8c234e7671488cc7e62c5552ae2f7b838a6e8788aef33ca9e2416e/contract.json" with { type: "json" };
import startContract from "../../snapshots/eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: "public",
        table: "release_log",
        column: col("revision", "int8", {
          notNull: true,
          default: lit("1"),
          codecRef: { codecId: "pg/int8number@1" },
        }),
      }),
      this.addColumn({
        schema: "public",
        table: "release_log",
        column: col("status", "text", {
          notNull: true,
          default: lit("published"),
          codecRef: { codecId: "pg/text@1" },
        }),
      }),
      this.addColumn({
        schema: "public",
        table: "release_log",
        column: col("updatedAt", "timestamptz", { codecRef: { codecId: "pg/timestamptz-date@1" } }),
      }),
      this.dropNotNull({ schema: "public", table: "post", column: "categoryId" }),
      this.dropNotNull({ schema: "public", table: "post", column: "slug" }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
