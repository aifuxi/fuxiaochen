import request from "@/libs/request";
import type { CommonModel, CommonResponse, ListReq } from "./common";

export interface Category extends CommonModel {
  name: string;
  slug: string;
  description: string;
  blogCount: number;
}

export interface CategoryListReq extends ListReq {
  name?: string;
  slug?: string;
}

export interface CategoryListResp {
  total: number;
  lists: Category[];
}

export interface CategoryCreateReq {
  name: string;
  slug: string;
  description?: string;
}

const API_BASE_PATH = "/api/v1/categories";

/** 获取分类列表 */
export async function getCategoryList(req: CategoryListReq) {
  const res = await request.get<CommonResponse<CategoryListResp>>(
    API_BASE_PATH,
    {
      params: req,
    }
  );
  return res.data;
}

/** 获取分类详情 */
export async function getCategoryDetail(categoryID: string) {
  const res = await request.get<CommonResponse<Category>>(
    `${API_BASE_PATH}/${categoryID}`
  );
  return res.data;
}

/** 创建分类 */
export async function createCategory(req: CategoryCreateReq) {
  const res = await request.post<CommonResponse<Category>>(API_BASE_PATH, req);
  return res.data;
}

/** 更新分类 */
export async function updateCategory(
  categoryID: string,
  req: CategoryCreateReq
) {
  const res = await request.put<CommonResponse<Category>>(
    `${API_BASE_PATH}/${categoryID}`,
    req
  );
  return res.data;
}

/** 删除分类 */
export async function deleteCategory(categoryID: string) {
  const res = await request.delete<CommonResponse<void>>(
    `${API_BASE_PATH}/${categoryID}`
  );
  return res.data;
}
