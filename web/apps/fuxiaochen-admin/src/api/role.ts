import request from "@/libs/request";

import type {
	CommonResponse,
	RoleListReq,
	RoleListResp,
	RoleResp,
} from "fuxiaochen-types";

const API_BASE_PATH = "/api/v1/roles";

/** 获取角色列表 */
export async function getRoleList(req: RoleListReq) {
	const res = await request.get<CommonResponse<RoleListResp>>(API_BASE_PATH, {
		params: req,
	});
	return res.data;
}

/** 获取角色详情 */
export async function getRoleDetail(roleID: string) {
	const res = await request.get<CommonResponse<RoleResp>>(
		`${API_BASE_PATH}/${roleID}`
	);
	return res.data;
}
