#!/usr/bin/env -S node
import { Migration, MigrationCLI, col } from "@prisma/orm-postgres/migration";

import type { Contract as Start } from "../../snapshots/4034c730654ca13b0fa6eb03cc03aed204c6d65226eccc6a605b2add5bb65d44/contract";
import type { Contract as End } from "../../snapshots/eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8/contract";

import startContract from "../../snapshots/4034c730654ca13b0fa6eb03cc03aed204c6d65226eccc6a605b2add5bb65d44/contract.json" with { type: "json" };
import endContract from "../../snapshots/eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: "public",
        table: "site_setting",
        column: col("baiduVerification", "text", { codecRef: { codecId: "pg/text@1" } }),
      }),
      this.addColumn({
        schema: "public",
        table: "site_setting",
        column: col("bingVerification", "text", { codecRef: { codecId: "pg/text@1" } }),
      }),
      this.addColumn({
        schema: "public",
        table: "site_setting",
        column: col("googleVerification", "text", { codecRef: { codecId: "pg/text@1" } }),
      }),
      this.addColumn({
        schema: "public",
        table: "site_setting",
        column: col("ogImageUrl", "text", { codecRef: { codecId: "pg/text@1" } }),
      }),
      this.addColumn({
        schema: "public",
        table: "site_setting",
        column: col("seoDescription", "text", { codecRef: { codecId: "pg/text@1" } }),
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
