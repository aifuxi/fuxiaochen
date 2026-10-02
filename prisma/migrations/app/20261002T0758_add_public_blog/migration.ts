#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  primaryKey,
  dataTransform,
} from "@prisma/orm-sqlite/migration";

import type { Contract as Start } from "../../snapshots/7b1b682c1a713720849255fd5602d202dd42da85b675c9bf4b43f0c1a9a72b7d/contract";
import type { Contract as End } from "../../snapshots/9cc8e9fd5de9ee30a9aa2341ff0f803bcb17c503fc54f11c96cc76747b529cab/contract";

import startContract from "../../snapshots/7b1b682c1a713720849255fd5602d202dd42da85b675c9bf4b43f0c1a9a72b7d/contract.json" with { type: "json" };
import endContract from "../../snapshots/9cc8e9fd5de9ee30a9aa2341ff0f803bcb17c503fc54f11c96cc76747b529cab/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "comment_rate_limit",
        columns: [
          col("count", "INTEGER", { notNull: true }),
          col("expiresAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("window", "INTEGER", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.addColumn({
        table: "comment",
        column: { name: "authorKind", typeSql: "TEXT", defaultSql: "", nullable: true },
      }),
      this.addColumn({
        table: "comment",
        column: { name: "submissionHash", typeSql: "TEXT", defaultSql: "", nullable: true },
      }),
      this.addColumn({
        table: "comment",
        column: { name: "submissionId", typeSql: "TEXT", defaultSql: "", nullable: true },
      }),
      this.addColumn({
        table: "post",
        column: { name: "slug", typeSql: "TEXT", defaultSql: "", nullable: true },
      }),
      this.addColumn({
        table: "post",
        column: { name: "slugLockedAt", typeSql: "TEXT", defaultSql: "", nullable: true },
      }),
      this.createIndex({
        table: "comment_rate_limit",
        index: "comment_rate_limit_expiresAt_idx_6b6b8c10",
        columns: ["expiresAt"],
      }),
      this.createIndex({
        table: "post",
        index: "post_status_publishedAt_id_idx_a01ed76d",
        columns: ["status", "publishedAt", "id"],
      }),
      dataTransform({
        id: "backfill.comment.authorKind",
        label: "保留历史评论身份",
        table: "comment",
        description: "历史回复均来自管理员；显式保存身份以支持读者回复",
        run: () =>
          "UPDATE comment SET authorKind = CASE WHEN adminId IS NOT NULL OR parentId IS NOT NULL THEN 'admin' ELSE 'reader' END",
      }),
      this.recreateTable({
        tableName: "comment",
        contractTable: {
          columns: [
            { name: "adminId", typeSql: "INTEGER", defaultSql: "", nullable: true },
            { name: "author", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "authorKind", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "content", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "createdAt", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "email", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "id", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "parentId", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "postId", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "status", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "submissionHash", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "submissionId", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "updatedAt", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "version", typeSql: "INTEGER", defaultSql: "", nullable: false },
          ],
          primaryKey: { columns: ["id"] },
          uniques: [{ columns: ["submissionId"] }, { columns: ["id", "postId"] }],
          foreignKeys: [
            {
              columns: ["postId"],
              references: { table: "post", columns: ["id"] },
              onDelete: "cascade",
            },
            {
              columns: ["parentId", "postId"],
              references: { table: "comment", columns: ["id", "postId"] },
              onDelete: "cascade",
            },
            {
              columns: ["adminId"],
              references: { table: "admin", columns: ["id"] },
              onDelete: "setNull",
            },
          ],
        },
        schemaColumnNames: [
          "authorKind",
          "submissionHash",
          "submissionId",
          "adminId",
          "author",
          "content",
          "createdAt",
          "email",
          "id",
          "parentId",
          "postId",
          "status",
          "updatedAt",
          "version",
        ],
        indexes: [
          { name: "comment_adminId_idx_530179db", columns: ["adminId"] },
          { name: "comment_createdAt_id_idx_3855cff1", columns: ["createdAt", "id"] },
          { name: "comment_parentId_idx_6a68f597", columns: ["parentId"] },
          {
            name: "comment_parentId_postId_idx_1317b68e",
            columns: ["parentId", "postId"],
          },
          { name: "comment_postId_idx_a7a72715", columns: ["postId"] },
          {
            name: "comment_status_createdAt_id_idx_ffb42ad8",
            columns: ["status", "createdAt", "id"],
          },
        ],
        summary:
          "Recreates table comment to apply schema changes: database/comment/unique:submissionId",
        postchecks: [
          {
            description: 'verify unique constraint (submissionId) on "comment"',
            sql: "SELECT EXISTS (SELECT 1 FROM pragma_index_list('comment') l WHERE l.\"unique\" = 1 AND (SELECT COUNT(*) FROM pragma_index_info(l.name)) = 1 AND (SELECT COUNT(*) FROM pragma_index_info(l.name) WHERE name IN ('submissionId')) = 1)",
          },
          {
            description: 'verify unique constraint (id, postId) on "comment"',
            sql: "SELECT EXISTS (SELECT 1 FROM pragma_index_list('comment') l WHERE l.\"unique\" = 1 AND (SELECT COUNT(*) FROM pragma_index_info(l.name)) = 2 AND (SELECT COUNT(*) FROM pragma_index_info(l.name) WHERE name IN ('id', 'postId')) = 2)",
          },
        ],
        operationClass: "destructive",
      }),
      this.recreateTable({
        tableName: "post",
        contractTable: {
          columns: [
            { name: "categoryId", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "content", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "createdAt", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "id", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "publishedAt", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "scheduledFor", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "slug", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "slugLockedAt", typeSql: "TEXT", defaultSql: "", nullable: true },
            { name: "status", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "title", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "updatedAt", typeSql: "TEXT", defaultSql: "", nullable: false },
            { name: "version", typeSql: "INTEGER", defaultSql: "", nullable: false },
          ],
          primaryKey: { columns: ["id"] },
          uniques: [{ columns: ["slug"] }],
          foreignKeys: [
            {
              columns: ["categoryId"],
              references: { table: "category", columns: ["id"] },
              onDelete: "restrict",
            },
          ],
        },
        schemaColumnNames: [
          "slug",
          "slugLockedAt",
          "categoryId",
          "content",
          "createdAt",
          "id",
          "publishedAt",
          "scheduledFor",
          "status",
          "title",
          "updatedAt",
          "version",
        ],
        indexes: [
          { name: "post_categoryId_idx_15c304f2", columns: ["categoryId"] },
          { name: "post_createdAt_id_idx_3855cff1", columns: ["createdAt", "id"] },
          {
            name: "post_status_publishedAt_id_idx_a01ed76d",
            columns: ["status", "publishedAt", "id"],
          },
          {
            name: "post_status_scheduledFor_idx_e20b7d95",
            columns: ["status", "scheduledFor"],
          },
        ],
        summary: "Recreates table post to apply schema changes: database/post/unique:slug",
        postchecks: [
          {
            description: 'verify unique constraint (slug) on "post"',
            sql: "SELECT EXISTS (SELECT 1 FROM pragma_index_list('post') l WHERE l.\"unique\" = 1 AND (SELECT COUNT(*) FROM pragma_index_info(l.name)) = 1 AND (SELECT COUNT(*) FROM pragma_index_info(l.name) WHERE name IN ('slug')) = 1)",
          },
        ],
        operationClass: "destructive",
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
