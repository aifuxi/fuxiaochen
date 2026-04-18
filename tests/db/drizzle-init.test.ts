import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import assert from "node:assert/strict";
import test from "node:test";

import { createDb } from "../../lib/db/index";
import {
  blogTags,
  blogs,
  categories,
  changelogs,
  schema,
  tags,
} from "../../lib/db/schema";

test("schema exports every table from the postgres ddl", () => {
  assert.equal(getTableName(categories), "categories");
  assert.equal(getTableName(tags), "tags");
  assert.equal(getTableName(blogs), "blogs");
  assert.equal(getTableName(blogTags), "blog_tags");
  assert.equal(getTableName(changelogs), "changelogs");
  assert.deepEqual(Object.keys(schema).sort(), [
    "blogTags",
    "blogs",
    "categories",
    "changelogs",
    "tags",
  ]);
});

test("blogs keeps the expected foreign key and indexes", () => {
  const config = getTableConfig(blogs);

  assert.equal(getTableColumns(blogs).categoryId.name, "category_id");
  assert.equal(config.foreignKeys.length, 1);
  assert.equal(config.foreignKeys[0]?.getName(), "blogs_category_id_fkey");
  const indexNames = config.indexes
    .map((index) => index.config.name ?? "")
    .sort((left, right) => left.localeCompare(right));

  assert.deepEqual(indexNames, [
    "blogs_category_id_idx",
    "blogs_published_published_at_idx",
  ]);
});

test("createDb returns a schema-aware drizzle instance", () => {
  const db = createDb(
    "postgresql://postgres:postgres@localhost:5432/fuxiaochen",
  );

  assert.ok(db);
  assert.ok("blogs" in db.query);
  assert.ok("categories" in db.query);
  assert.ok("changelogs" in db.query);
});
