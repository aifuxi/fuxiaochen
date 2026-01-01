import request from "@/libs/request";
import type { CommonModel, CommonResponse, ListReq } from "./common";
import type { Tag } from "./tag";
import type { Category } from "./category";

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
  title?: string;
  slug?: string;
  categoryID?: string;
  blogIDs?: string[];
}

export interface BlogListResp {
  total: number;
  lists: Blog[];
}

export interface BlogCreateReq {
  title: string;
  slug: string;
  description: string;
  cover?: string;
  content: string;
  published: boolean;
  categoryID?: string;
  tagIDs?: string[];
}

const API_BASE_PATH = "/api/v1/blogs";

/** 获取博客列表 */
export async function getBlogList(req: BlogListReq) {
  const res = await request.get<CommonResponse<BlogListResp>>(API_BASE_PATH, {
    params: req,
  });
  return res.data;
}

/** 获取博客详情 */
export async function getBlogDetail(blogID: string) {
  const res = await request.get<CommonResponse<Blog>>(
    `${API_BASE_PATH}/${blogID}`
  );
  return res.data;
}

/** 创建博客 */
export async function createBlog(req: BlogCreateReq) {
  const res = await request.post<CommonResponse<Blog>>(API_BASE_PATH, req);
  return res.data;
}

/** 更新博客 */
export async function updateBlog(blogID: string, req: BlogCreateReq) {
  const res = await request.put<CommonResponse<Blog>>(
    `${API_BASE_PATH}/${blogID}`,
    req
  );
  return res.data;
}

/** 删除博客 */
export async function deleteBlog(blogID: string) {
  const res = await request.delete<CommonResponse<void>>(
    `${API_BASE_PATH}/${blogID}`
  );
  return res.data;
}
