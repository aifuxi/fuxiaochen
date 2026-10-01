#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, primaryKey, unique } from "@prisma/orm-sqlite/migration";

import type { Contract as Start } from "../../snapshots/19eb13512da6dbea65de7922fe8f1db42daef25e6b072640c35863b01720aa25/contract";
import type { Contract as End } from "../../snapshots/f0b62a75826f509074906baeedbf788bab4bc2a81d71a0b13b0d5e92dd5c44ca/contract";

import startContract from "../../snapshots/19eb13512da6dbea65de7922fe8f1db42daef25e6b072640c35863b01720aa25/contract.json" with { type: "json" };
import endContract from "../../snapshots/f0b62a75826f509074906baeedbf788bab4bc2a81d71a0b13b0d5e92dd5c44ca/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "category",
        columns: [
          col("color", "TEXT", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("name", "TEXT", { notNull: true }),
          col("nameKey", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"]), unique(["nameKey"])],
      }),
      this.createTable({
        table: "tag",
        columns: [
          col("createdAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("name", "TEXT", { notNull: true }),
          col("nameKey", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"]), unique(["nameKey"])],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
