import { publicPostParams, publicPostQuerySchema, queryPath } from "../public/schema";

/** 详情的返回地址只承载文章筛选，不接受任意站内或站外跳转。 */
export function articleReturnPath(value: string | string[] | undefined | null) {
  if (typeof value !== "string" || !/^\/posts(?:\?|$)/.test(value)) return "/posts";
  try {
    const url = new URL(value, "https://article-return.invalid");
    if (url.pathname !== "/posts" || url.origin !== "https://article-return.invalid" || url.hash)
      return "/posts";

    const allowed = ["q", "categoryId", "tagId", "page"];
    if (allowed.some((key) => url.searchParams.getAll(key).length > 1)) return "/posts";
    const params = Object.fromEntries(
      allowed
        .map((key) => [key, url.searchParams.get(key)])
        .filter((entry) => entry[1] !== null && entry[1] !== ""),
    );
    const parsed = publicPostQuerySchema.safeParse(params);
    return parsed.success ? queryPath("/posts", publicPostParams(parsed.data)) : "/posts";
  } catch {
    return "/posts";
  }
}
