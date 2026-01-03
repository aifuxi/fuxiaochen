import request from "@/lib/request";

import type { Category } from "./category";
import type { CommonModel, CommonResponse, ListReq } from "./common";
import type { Tag } from "./tag";

export interface Blog extends CommonModel {
  title: string;
  slug: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  publishedAt?: string;
  categoryID: string;
  category?: Category;
  tags?: Tag[];
}

export interface BlogListReq extends ListReq {
  featuredStatus?: "featured" | "unfeatured";
}

export interface BlogListResp {
  total: number;
  lists: Blog[];
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
