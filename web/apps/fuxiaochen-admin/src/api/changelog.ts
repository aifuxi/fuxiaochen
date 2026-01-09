import type {
  Changelog,
  ChangelogCreateReq,
  ChangelogListReq,
  ChangelogListResp,
  CommonResponse,
} from "fuxiaochen-types";

import request from "@/libs/request";

const API_BASE_PATH = "/api/v1/changelogs";

/** 获取更新日志列表 */
export async function getChangelogList(req: ChangelogListReq) {
  const res = await request.get<CommonResponse<ChangelogListResp>>(
    API_BASE_PATH,
    {
      params: req,
    },
  );
  return res.data;
}

/** 获取更新日志详情 */
export async function getChangelogDetail(changelogID: string) {
  const res = await request.get<CommonResponse<Changelog>>(
    `${API_BASE_PATH}/${changelogID}`,
  );
  return res.data;
}

/** 创建更新日志 */
export async function createChangelog(req: ChangelogCreateReq) {
  const res = await request.post<CommonResponse<Changelog>>(API_BASE_PATH, req);
  return res.data;
}

/** 更新更新日志 */
export async function updateChangelog(
  changelogID: string,
  req: ChangelogCreateReq,
) {
  const res = await request.put<CommonResponse<Changelog>>(
    `${API_BASE_PATH}/${changelogID}`,
    req,
  );
  return res.data;
}

/** 删除更新日志 */
export async function deleteChangelog(changelogID: string) {
  const res = await request.delete<CommonResponse<void>>(
    `${API_BASE_PATH}/${changelogID}`,
  );
  return res.data;
}
