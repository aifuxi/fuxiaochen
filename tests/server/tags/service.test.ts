import assert from "node:assert/strict";
import test from "node:test";

import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import { AppError } from "../../../lib/server/http/errors";
import type { TagRepository } from "../../../lib/server/tags/repository";
import { tagListOrderBy } from "../../../lib/server/tags/repository";
import { createTagService } from "../../../lib/server/tags/service";

test("createTag generates an id and timestamps before persisting", async () => {
  const now = new Date("2026-04-19T10:00:00.000Z");
  type CreateTagInput = Parameters<TagRepository["create"]>[0];

  const calls: CreateTagInput[] = [];
  const repository: TagRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async create(tag: CreateTagInput) {
      calls.push(tag);
      return tag;
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createTagService({
    repository,
    generateId: () => "tag_test_1",
    now: () => now,
  });

  const result = await service.createTag({
    name: "Design",
    slug: "design",
    description: "Design notes and assets",
  });

  assert.deepEqual(result, {
    id: "tag_test_1",
    createdAt: now,
    updatedAt: now,
    name: "Design",
    slug: "design",
    description: "Design notes and assets",
  });
  assert.deepEqual(calls, [
    {
      id: "tag_test_1",
      createdAt: now,
      updatedAt: now,
      name: "Design",
      slug: "design",
      description: "Design notes and assets",
    },
  ]);
});

test("createTag rejects duplicate slugs with TAG_SLUG_CONFLICT", async () => {
  const repository: TagRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return {
        id: "tag_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        name: "Existing",
        slug: "design",
        description: "Existing tag",
      };
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createTagService({ repository });

  await assert.rejects(
    service.createTag({
      name: "Design",
      slug: "design",
      description: "Design notes and assets",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.TAG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("createTag converts repository duplicate errors into TAG_SLUG_CONFLICT", async () => {
  const duplicateError = Object.assign(new Error("duplicate key"), {
    code: "23505",
  });

  const repository: TagRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw duplicateError;
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createTagService({ repository });

  await assert.rejects(
    service.createTag({
      name: "Design",
      slug: "design",
      description: "Design notes and assets",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.TAG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("updateTag rejects missing tags with TAG_NOT_FOUND", async () => {
  const repository: TagRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      return false;
    },
  };

  const service = createTagService({ repository });

  await assert.rejects(
    service.updateTag("tag_missing", {
      description: "Updated description",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.TAG_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("updateTag converts repository duplicate errors into TAG_SLUG_CONFLICT", async () => {
  const duplicateError = Object.assign(new Error("duplicate key"), {
    code: "23505",
  });

  const repository: TagRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "tag_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        name: "Existing",
        slug: "design",
        description: "Existing tag",
      };
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw duplicateError;
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createTagService({ repository });

  await assert.rejects(
    service.updateTag("tag_existing", {
      slug: "design-2",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.TAG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("deleteTag converts delete races into TAG_NOT_FOUND", async () => {
  const repository: TagRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "tag_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        name: "Existing",
        slug: "design",
        description: "Existing tag",
      };
    },
    async findBySlug() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      return false;
    },
  };

  const service = createTagService({ repository });

  await assert.rejects(service.deleteTag("tag_existing"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, ERROR_CODES.TAG_NOT_FOUND);
    assert.equal(error.status, 404);
    return true;
  });
});

test("tagRepository list order is stable for pagination", () => {
  const orderedColumns = tagListOrderBy.map((clause) => {
    const column = clause.queryChunks[1];

    if (
      typeof column === "object" &&
      column !== null &&
      "name" in column &&
      typeof column.name === "string"
    ) {
      return column.name;
    }

    return null;
  });

  assert.deepEqual(orderedColumns, ["created_at", "id"]);
});
