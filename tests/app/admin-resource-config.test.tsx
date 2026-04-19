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
  const categoryConfig = getAdminResourceConfig("categories");
  const tagConfig = getAdminResourceConfig("tags");
  const changelogConfig = getAdminResourceConfig("changelogs");

  assert.deepEqual(
    categoryConfig.columns.map((column) => column.key),
    ["name", "slug", "description", "updatedAt"],
  );
  assert.equal(categoryConfig.createLabel, "Add Category");
  assert.equal(categoryConfig.drawer.editTitle, "Edit category");
  assert.equal(categoryConfig.form.submitLabel, "Save Category");

  assert.equal(tagConfig.createLabel, "Add Tag");
  assert.equal(tagConfig.defaultListParams.sortBy, "createdAt");
  assert.equal(tagConfig.drawer.editTitle, "Edit tag");
  assert.equal(tagConfig.form.deleteLabel, "Delete Tag");

  assert.equal(changelogConfig.title, "Changelog");
  assert.equal(changelogConfig.createLabel, "Add Entry");
  assert.deepEqual(
    changelogConfig.columns.map((column) => column.key),
    ["version", "releaseDate", "contentPreview", "updatedAt"],
  );
  assert.equal(changelogConfig.defaultListParams.sortBy, "releaseDate");
  assert.equal(changelogConfig.drawer.editTitle, "Edit entry");
  assert.equal(
    changelogConfig.drawer.description,
    "Edit metadata and long-form release notes.",
  );
  assert.equal(changelogConfig.form.submitLabel, "Save Entry");
});
