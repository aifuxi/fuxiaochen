import assert from "node:assert/strict";
import { test } from "node:test";

import { adminPostReturnTo } from "../lib/admin/navigation";

await test("编辑返回地址仅接受本站文章列表并保留查询", () => {
  assert.equal(
    adminPostReturnTo("/admin/posts?q=Flutter&status=draft&page=2"),
    "/admin/posts?q=Flutter&status=draft&page=2",
  );
  for (const value of [
    null,
    "https://evil.example/admin/posts",
    "//evil.example/admin/posts",
    "javascript:alert(1)",
    "/admin/posts/new",
    "/admin/\\evil",
    "/admin/posts\n",
  ])
    assert.equal(adminPostReturnTo(value), "/admin/posts");
});

await test("趋势空值不连线，空集、全零及单点均生成有限坐标", async () => {
  const { trendGeometry } = await import("../lib/analytics/trend");
  for (const trend of [
    [],
    [{ date: "2026-10-01", pv: 0, uv: 0 }],
    [{ date: "2026-10-01", pv: null, uv: null }],
    [{ date: "2026-10-01", pv: 12, uv: 3 }],
  ]) {
    const geometry = trendGeometry(trend);
    assert.ok(Number.isFinite(geometry.max));
    assert.ok(!/NaN|Infinity/.test(geometry.path("pvY")));
    for (const point of geometry.points)
      assert.ok(Number.isFinite(point.x) && (point.pvY === null || Number.isFinite(point.pvY)));
  }
  const geometry = trendGeometry([
    { date: "1", pv: 1, uv: 1 },
    { date: "2", pv: null, uv: null },
    { date: "3", pv: 2, uv: 2 },
  ]);
  assert.equal(geometry.path("pvY").split("M").length - 1, 2);
  assert.ok(!geometry.path("pvY").includes("L"));
});
