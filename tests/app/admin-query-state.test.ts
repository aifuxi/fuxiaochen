import assert from "node:assert/strict";
import test from "node:test";

import {
  parseAdminListParams,
  toAdminListSearchParams,
} from "../../components/admin/admin-query-state";

test("parseAdminListParams normalizes page, pageSize, query, and booleans", () => {
  const params = new URLSearchParams(
    "page=0&pageSize=120&query=%20design%20&sortBy=updatedAt&sortDirection=sideways&published=1&featured=0&categoryId=%20cat_1%20",
  );

  assert.deepEqual(parseAdminListParams(params), {
    page: 1,
    pageSize: 100,
    query: "design",
    sortBy: "updatedAt",
    sortDirection: "desc",
    published: true,
    featured: false,
    categoryId: "cat_1",
  });
});

test("parseAdminListParams falls back to defaults and drops blank optional values", () => {
  const params = new URLSearchParams(
    "query=%20%20&sortBy=%20%20&published=%20%20&featured=maybe&categoryId=%20%20",
  );

  assert.deepEqual(
    parseAdminListParams(params, {
      pageSize: 25,
      sortBy: "publishedAt",
      sortDirection: "asc",
    }),
    {
      page: 1,
      pageSize: 25,
      sortBy: "publishedAt",
      sortDirection: "asc",
    },
  );
});

test("parseAdminListParams rejects malformed numeric values instead of truncating them", () => {
  const params = new URLSearchParams("page=1foo&pageSize=1.5");

  assert.deepEqual(parseAdminListParams(params), {
    page: 1,
    pageSize: 20,
    sortDirection: "desc",
  });
});

test("parseAdminListParams normalizes uppercase boolean values like the server DTOs", () => {
  const params = new URLSearchParams("published=TRUE&featured=FALSE");

  assert.deepEqual(parseAdminListParams(params), {
    page: 1,
    pageSize: 20,
    sortDirection: "desc",
    published: true,
    featured: false,
  });
});

test("toAdminListSearchParams serializes only normalized values", () => {
  const params = toAdminListSearchParams({
    page: 2,
    pageSize: 25,
    query: "admin shell",
    sortBy: "publishedAt",
    sortDirection: "asc",
    published: false,
    categoryId: "cat_2",
  });

  assert.equal(
    params.toString(),
    "page=2&pageSize=25&query=admin+shell&sortBy=publishedAt&sortDirection=asc&published=false&categoryId=cat_2",
  );
});
