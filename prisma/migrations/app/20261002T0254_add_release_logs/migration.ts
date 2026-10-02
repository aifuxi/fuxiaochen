#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, primaryKey } from "@prisma/orm-sqlite/migration";

import type { Contract as End } from "../../snapshots/7b1b682c1a713720849255fd5602d202dd42da85b675c9bf4b43f0c1a9a72b7d/contract";
import type { Contract as Start } from "../../snapshots/88bc0925deee6180938e34cf81239c08fc9c0b065c176db9833f63600c2dcc3f/contract";

import endContract from "../../snapshots/7b1b682c1a713720849255fd5602d202dd42da85b675c9bf4b43f0c1a9a72b7d/contract.json" with { type: "json" };
import startContract from "../../snapshots/88bc0925deee6180938e34cf81239c08fc9c0b065c176db9833f63600c2dcc3f/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "release_log",
        columns: [
          col("changes", "TEXT", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("title", "TEXT", { notNull: true }),
          col("type", "TEXT", { notNull: true }),
          col("version", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createIndex({
        table: "release_log",
        index: "release_log_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
