import assert from "node:assert/strict";
import test from "node:test";

import type { ChangelogRepository } from "../../../lib/server/changelogs/repository";
import { changelogListOrderBy } from "../../../lib/server/changelogs/repository";
import { createChangelogService } from "../../../lib/server/changelogs/service";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import { AppError } from "../../../lib/server/http/errors";

test("createChangelog generates an id and timestamps before persisting", async () => {
  const now = new Date("2026-04-19T10:00:00.000Z");
  type CreateInput = Parameters<ChangelogRepository["create"]>[0];

  const calls: CreateInput[] = [];
  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findByVersion() {
      return null;
    },
    async create(changelog: CreateInput) {
      calls.push(changelog);
      return changelog;
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createChangelogService({
    repository,
    generateId: () => "chg_test_1",
    now: () => now,
  });

  const result = await service.createChangelog({
    version: "1.0.0",
    content: "Initial release notes",
    releaseDate: "2026-04-19",
  });

  assert.deepEqual(result, {
    id: "chg_test_1",
    createdAt: now,
    updatedAt: now,
    version: "1.0.0",
    content: "Initial release notes",
    releaseDate: "2026-04-19",
  });
  assert.deepEqual(calls, [
    {
      id: "chg_test_1",
      createdAt: now,
      updatedAt: now,
      version: "1.0.0",
      content: "Initial release notes",
      releaseDate: "2026-04-19",
    },
  ]);
});

test("createChangelog rejects duplicate versions with CHANGELOG_VERSION_CONFLICT", async () => {
  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findByVersion() {
      return {
        id: "chg_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        version: "1.0.0",
        content: "Existing release notes",
        releaseDate: "2026-04-19",
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

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.createChangelog({
      version: "1.0.0",
      content: "Initial release notes",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CHANGELOG_VERSION_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("createChangelog converts repository duplicate errors into CHANGELOG_VERSION_CONFLICT", async () => {
  const duplicateError = Object.assign(new Error("duplicate key"), {
    code: "23505",
    constraint: "changelogs_version_key",
  });

  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findByVersion() {
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

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.createChangelog({
      version: "1.0.0",
      content: "Initial release notes",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CHANGELOG_VERSION_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("createChangelog does not normalize non-version unique violations", async () => {
  const uniqueError = Object.assign(new Error("duplicate key"), {
    code: "23505",
    constraint: "changelogs_release_date_idx",
  });

  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findByVersion() {
      return null;
    },
    async create() {
      throw uniqueError;
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.createChangelog({
      version: "1.0.0",
      content: "Initial release notes",
    }),
    (error: unknown) => {
      assert.equal(error, uniqueError);
      return true;
    },
  );
});

test("updateChangelog converts repository duplicate errors into CHANGELOG_VERSION_CONFLICT", async () => {
  const duplicateError = Object.assign(new Error("duplicate key"), {
    code: "23505",
    constraint: "changelogs_version_key",
  });

  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "chg_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        version: "1.0.0",
        content: "Existing release notes",
        releaseDate: "2026-04-19",
      };
    },
    async findByVersion() {
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

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.updateChangelog("chg_existing", {
      version: "1.0.1",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CHANGELOG_VERSION_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("updateChangelog does not normalize non-version unique violations", async () => {
  const uniqueError = Object.assign(new Error("duplicate key"), {
    code: "23505",
    constraint: "changelogs_content_key",
  });

  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "chg_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        version: "1.0.0",
        content: "Existing release notes",
        releaseDate: "2026-04-19",
      };
    },
    async findByVersion() {
      return null;
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw uniqueError;
    },
    async delete() {
      throw new Error("not used");
    },
  };

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.updateChangelog("chg_existing", {
      content: "Updated release notes",
    }),
    (error: unknown) => {
      assert.equal(error, uniqueError);
      return true;
    },
  );
});

test("updateChangelog rejects missing changelogs with CHANGELOG_NOT_FOUND", async () => {
  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findByVersion() {
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

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.updateChangelog("chg_missing", {
      content: "Updated release notes",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CHANGELOG_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("deleteChangelog converts delete races into CHANGELOG_NOT_FOUND", async () => {
  const repository: ChangelogRepository = {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return {
        id: "chg_existing",
        createdAt: new Date("2026-04-19T10:00:00.000Z"),
        updatedAt: new Date("2026-04-19T10:00:00.000Z"),
        version: "1.0.0",
        content: "Existing release notes",
        releaseDate: "2026-04-19",
      };
    },
    async findByVersion() {
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

  const service = createChangelogService({ repository });

  await assert.rejects(
    service.deleteChangelog("chg_existing"),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.CHANGELOG_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("changelogListOrderBy places null release dates last", () => {
  const nullsLastOrder = changelogListOrderBy[0] as {
    queryChunks: Array<{ value: string[] }>;
  };

  assert.equal(nullsLastOrder.queryChunks[2].value[0], " is null");
});
