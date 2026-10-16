import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { api } from "../lib/api";
import { writeTransaction } from "../lib/database";
import { backupRun } from "../lib/database/schema";
import { listBackups } from "../lib/operations/backups";
import { backupQuerySchema, type BackupItem, type BackupPage } from "../lib/operations/schema";
import { createTestDatabase } from "./helpers/sqlite";

let fixture: Awaited<ReturnType<typeof createTestDatabase>>;
let cookie: string;
const origin = "https://sqlite-test.example";
const records: BackupItem[] = [];

before(async () => {
  // 所有写入只进入现有测试助手创建的临时独立 SQLite 文件。
  fixture = await createTestDatabase();
  const createdAt = Date.now() - 60_000;
  for (let index = 0; index < 14; index += 1) {
    const status = (["running", "complete", "failed"] as const)[index % 3];
    const date = new Date(createdAt + Math.floor(index / 2) * 1000);
    records.push({
      id: `sort-${String(index).padStart(2, "0")}`,
      status,
      bytes: status === "complete" ? ((index + 2) % 4) * 1024 : null,
      sha256: null,
      createdAt: date.toISOString(),
      finishedAt: status === "running" ? null : date.toISOString(),
    });
  }
  writeTransaction((tx) =>
    tx
      .insert(backupRun)
      .values(
        records.map((record) => ({
          ...record,
          dailyKey: null,
          createdAt: new Date(record.createdAt),
          finishedAt: record.finishedAt ? new Date(record.finishedAt) : null,
        })),
      )
      .run(),
  );
  const login = await api.request(`${origin}/api/login`, {
    method: "POST",
    headers: { Origin: origin, Accept: "application/json" },
    body: new URLSearchParams({ username: "test_admin", password: fixture.password }),
  });
  assert.equal(login.status, 200);
  cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
});

after(async () => fixture?.cleanup());

function expected(sortBy: "createdAt" | "status" | "bytes", sortDirection: "asc" | "desc") {
  const multiplier = sortDirection === "asc" ? 1 : -1;
  const ranks = { running: 0, complete: 1, failed: 2 };
  return records.toSorted((left, right) => {
    let comparison = 0;
    if (sortBy === "bytes") {
      if ((left.bytes === null) !== (right.bytes === null)) return left.bytes === null ? 1 : -1;
      comparison = (left.bytes ?? 0) - (right.bytes ?? 0);
    } else if (sortBy === "status") comparison = ranks[left.status] - ranks[right.status];
    else comparison = Date.parse(left.createdAt) - Date.parse(right.createdAt);
    return comparison * multiplier || right.id.localeCompare(left.id);
  });
}

void test("备份默认查询兼容旧参数，时间并列按 ID 降序稳定排序", async () => {
  assert.deepEqual(backupQuerySchema.parse({}), {
    page: 1,
    pageSize: 8,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const result = await listBackups({ q: "", page: 1, pageSize: 100 }, fixture.actor);
  assert.deepEqual(
    result.items.map((item) => item.id),
    expected("createdAt", "desc").map((item) => item.id),
  );
});

void test("备份六种排序先覆盖全结果再分页，空大小始终末位且追加无重复", async () => {
  for (const sortBy of ["createdAt", "status", "bytes"] as const) {
    for (const sortDirection of ["asc", "desc"] as const) {
      const items: BackupItem[] = [];
      for (let page = 1; page <= 4; page += 1) {
        const result = await listBackups(
          { q: "", page, pageSize: 4, sortBy, sortDirection },
          fixture.actor,
        );
        assert.equal(result.total, 14);
        assert.equal(result.pageCount, 4);
        assert.equal(result.page, page);
        items.push(...result.items);
      }
      assert.deepEqual(
        items.map((item) => item.id),
        expected(sortBy, sortDirection).map((item) => item.id),
        `${sortBy} ${sortDirection}`,
      );
      assert.equal(new Set(items.map((item) => item.id)).size, 14);
    }
  }
});

void test("备份 GET 校验排序白名单并传入全结果查询，未知参数不进入 SQL", async () => {
  const sorted = await api.request(
    `${origin}/api/admin/backups?sortBy=status&sortDirection=asc&pageSize=4&page=2`,
    { headers: { Cookie: cookie } },
  );
  assert.equal(sorted.status, 200);
  const result: BackupPage = (await sorted.json()).data;
  assert.deepEqual(
    result.items.map((item) => item.id),
    expected("status", "asc")
      .slice(4, 8)
      .map((item) => item.id),
  );
  for (const params of [
    new URLSearchParams({ sortBy: "bytes); DROP TABLE backup_run; --" }),
    new URLSearchParams({ sortDirection: "sideways" }),
  ]) {
    const response = await api.request(`${origin}/api/admin/backups?${params}`, {
      headers: { Cookie: cookie },
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "INVALID_INPUT");
    assert.ok(body.error.fieldErrors[params.has("sortBy") ? "sortBy" : "sortDirection"]);
  }
  const ignored = await api.request(
    `${origin}/api/admin/backups?unknownOrder=DROP%20TABLE%20backup_run&pageSize=100`,
    { headers: { Cookie: cookie } },
  );
  assert.equal(ignored.status, 200);
  const unchanged: BackupPage = (await ignored.json()).data;
  assert.equal(unchanged.total, 14);
  assert.deepEqual(
    unchanged.items.map((item) => item.id),
    expected("createdAt", "desc").map((item) => item.id),
  );
  const unauthorized = await api.request(`${origin}/api/admin/backups?sortBy=bytes`);
  assert.equal(unauthorized.status, 401);
});
