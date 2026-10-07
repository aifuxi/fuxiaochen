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
