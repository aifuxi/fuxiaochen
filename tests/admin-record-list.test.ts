import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeResourcePages } from "../components/admin/use-paged-resource";

type Item = { id: string; version: number };
function page(index: number, items: Item[], total = 4) {
  return { page: index, items, total, pageSize: 2, pageCount: Math.ceil(total / 2) };
}

await test("追加与向前加载按服务端批次排列，重复记录不出现两次", () => {
  const later = page(2, [
    { id: "b", version: 1 },
    { id: "c", version: 1 },
  ]);
  const earlier = page(
    1,
    [
      { id: "a", version: 1 },
      { id: "b", version: 2 },
    ],
    3,
  );
  const result = mergeResourcePages([later, earlier]);
  assert.deepEqual(result?.items, [
    { id: "a", version: 1 },
    { id: "b", version: 2 },
    { id: "c", version: 1 },
  ]);
  // 返回全部数量和版本以最近响应为准，不能被缓存中的较后页覆盖。
  assert.equal(result?.total, 3);
  assert.deepEqual(later.items, [
    { id: "b", version: 1 },
    { id: "c", version: 1 },
  ]);
});

await test("初始空批次与零记录结果保持区别", () => {
  assert.equal(mergeResourcePages([]), null);
  assert.deepEqual(mergeResourcePages([page(1, [], 0)]), page(1, [], 0));
});

await test("较后响应覆盖跨批重复记录的版本与统计", () => {
  const result = mergeResourcePages([
    page(1, [
      { id: "a", version: 1 },
      { id: "b", version: 1 },
    ]),
    page(
      2,
      [
        { id: "b", version: 3 },
        { id: "c", version: 2 },
      ],
      3,
    ),
  ]);
  assert.deepEqual(
    result?.items.map((item) => [item.id, item.version]),
    [
      ["a", 1],
      ["b", 3],
      ["c", 2],
    ],
  );
  assert.equal(result?.pageCount, 2);
});
