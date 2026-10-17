import assert from "node:assert/strict";
import { test } from "node:test";

import { articleReturnPath } from "../lib/frontend/article-return";

const categoryId = "6c34a2b7-c58f-4570-8930-4f1c0fbcab12";
const tagId = "735451d0-5fb9-4c3e-940b-968359abbb67";

void test("文章返回地址保留合法组合筛选和页码，去掉追踪与跳转参数", () => {
  const input = new URLSearchParams({
    page: "3",
    tagId,
    categoryId,
    q: "  阅读 与设计  ",
    utm_source: "newsletter",
    redirect: "https://foreign.example/",
  });
  const expected = new URLSearchParams({ q: "阅读 与设计", categoryId, tagId, page: "3" });
  assert.equal(articleReturnPath(`/posts?${input}`), `/posts?${expected}`);
  assert.equal(articleReturnPath("/posts?utm_source=newsletter"), "/posts");
});

void test("返回地址拒绝站外链接、非文章列表路径与片段，不成为开放跳转入口", () => {
  for (const input of [
    "https://foreign.example/posts?page=2",
    "https://article-return.invalid/posts?page=2",
    "//foreign.example/posts",
    "/\\foreign.example/posts",
    "javascript:alert(1)",
    "/admin/posts",
    "/posts/other-article",
    "/posts/../admin",
    "/posts%2f..%2fadmin",
    "/posts?next=//foreign.example/#target",
  ])
    assert.equal(articleReturnPath(input), "/posts", input);
});

void test("非法分类、标签或页码回退安全列表，合法第一页不产生重复地址", () => {
  for (const input of [
    "/posts?categoryId=not-a-uuid",
    "/posts?tagId=not-a-uuid",
    "/posts?page=0",
    "/posts?page=-1",
    "/posts?page=1.5",
    "/posts?page=1000001",
    "/posts?page=NaN",
    `/posts?${new URLSearchParams({ q: "字".repeat(201) })}`,
  ])
    assert.equal(articleReturnPath(input), "/posts", input);
  assert.equal(articleReturnPath("/posts?q=%20%20&page=1"), "/posts");
  assert.equal(articleReturnPath("/posts?q=CSS&page=01"), "/posts?q=CSS");
  assert.equal(
    articleReturnPath(`/posts?categoryId=${categoryId}&page=2`),
    `/posts?categoryId=${categoryId}&page=2`,
  );
});

void test("重复参数及多值 returnTo 不产生有歧义的返回路径", () => {
  assert.equal(articleReturnPath("/posts?q=first&q=second&page=2"), "/posts");
  assert.equal(articleReturnPath("/posts?page=2&page=3"), "/posts");
  assert.equal(articleReturnPath(["/posts?page=2", "https://foreign.example/"]), "/posts");
  assert.equal(articleReturnPath(undefined), "/posts");
  assert.equal(articleReturnPath(null), "/posts");
});

void test("关键词作为数据编码，特殊字符不会改变返回路径的导航目的地", () => {
  const q = "JavaScript & CSS / #阅读 ? next=https://foreign.example/";
  const expected = `/posts?${new URLSearchParams({ q })}`;
  assert.equal(articleReturnPath(expected), expected);
  const parsed = new URL(articleReturnPath(expected), "https://blog.example");
  assert.equal(parsed.origin, "https://blog.example");
  assert.equal(parsed.pathname, "/posts");
  assert.equal(parsed.searchParams.get("q"), q);
  assert.equal(parsed.hash, "");
});
