import type {
  ChangelogListReq,
  ChangelogListResp,
  CommonResponse,
} from "@/types";

import request from "@/lib/request";

const API_BASE_PATH = "/api/v1/public/changelogs";

/** 获取变更日志列表 */
export async function getChangelogList(req: ChangelogListReq) {
  const res = await request.get<CommonResponse<ChangelogListResp>>(
    API_BASE_PATH,
    {
      params: req,
    },
  );
  return res.data;
}
