import type { CommonResponse, Tag, TagListReq, TagListResp } from "@/types";

import request from "@/lib/request";

const API_BASE_PATH = "/api/v1/public/tags";

/** 获取标签列表 */
export async function getTagList(req: TagListReq) {
  const res = await request.get<CommonResponse<TagListResp>>(API_BASE_PATH, {
    params: req,
  });
  return res.data;
}

/** 获取标签详情 */
export async function getTagDetail(tagID: string) {
  const res = await request.get<CommonResponse<Tag>>(
    `${API_BASE_PATH}/${tagID}`,
  );
  return res.data;
}
