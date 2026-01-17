import type {
  Blog,
  BlogListResp,
  CommonResponse,
  ListReq,
} from "fuxiaochen-types";

import request from "@/lib/request";

export interface BlogListReq extends ListReq {
  featuredStatus?: "featured" | "unfeatured";
  /** category slug */
  category?: string;
  /** tag slugs */
  tags?: string[];
}

const API_BASE_PATH = "/api/v1/public/blogs";

/** 获取博客列表 */
export async function getBlogList(req: BlogListReq) {
  const res = await request.get<CommonResponse<BlogListResp>>(API_BASE_PATH, {
    params: req,
  });
  return res.data;
}

/** 获取博客详情 */
export async function getBlogDetail(slug: string) {
  const res = await request.get<CommonResponse<Blog>>(
    `${API_BASE_PATH}/${slug}`,
  );
  return res.data;
}
