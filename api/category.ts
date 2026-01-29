import type {
  Category,
  CategoryListReq,
  CategoryListResp,
  CommonResponse,
} from "@/types";

import request from "@/lib/request";

const API_BASE_PATH = "/api/v1/public/categories";

/** 获取分类列表 */
export async function getCategoryList(req: CategoryListReq) {
  const res = await request.get<CommonResponse<CategoryListResp>>(
    API_BASE_PATH,
    {
      params: req,
    },
  );
  return res.data;
}

/** 获取分类详情 */
export async function getCategoryDetail(slug: string) {
  const res = await request.get<CommonResponse<Category>>(
    `${API_BASE_PATH}/${slug}`,
  );
  return res.data;
}
