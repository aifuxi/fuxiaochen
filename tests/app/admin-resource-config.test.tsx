import assert from "node:assert/strict";
import test from "node:test";

import { getAdminResourceConfig } from "../../components/admin/admin-resource-config";

test("blogs resource config exposes table columns and drawer copy", () => {
  const config = getAdminResourceConfig("blogs");

  assert.equal(config.title, "Posts");
  assert.equal(config.createLabel, "Add Post");
  assert.deepEqual(
    config.columns.map((column) => column.key),
    [
      "title",
      "slug",
      "category",
      "status",
      "featured",
      "publishedAt",
      "updatedAt",
    ],
  );
  assert.equal(config.drawer.createTitle, "Create post");
  assert.equal(config.drawer.editTitle, "Edit post");
  assert.equal(config.defaultListParams.sortBy, "publishedAt");
  assert.equal(config.defaultListParams.sortDirection, "desc");
});

test("lightweight resources keep focused copy and default sorting", () => {
  assert.deepEqual(
    getAdminResourceConfig("categories").columns.map((column) => column.key),
    ["name", "slug", "description", "updatedAt"],
  );
  assert.equal(
    getAdminResourceConfig("categories").createLabel,
    "Add Category",
  );
  assert.equal(getAdminResourceConfig("tags").createLabel, "Add Tag");
  assert.equal(
    getAdminResourceConfig("tags").defaultListParams.sortBy,
    "createdAt",
  );

  const changelogConfig = getAdminResourceConfig("changelogs");

  assert.equal(changelogConfig.title, "Changelog");
  assert.equal(changelogConfig.createLabel, "Add Entry");
  assert.deepEqual(
    changelogConfig.columns.map((column) => column.key),
    ["version", "releaseDate", "contentPreview", "updatedAt"],
  );
  assert.equal(changelogConfig.defaultListParams.sortBy, "releaseDate");
  assert.equal(
    changelogConfig.drawer.description,
    "Edit metadata and long-form release notes.",
  );
});
