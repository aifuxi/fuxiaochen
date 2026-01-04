import request from "@/libs/request";
import type {
	CommonResponse,
	UserCreateReq,
	UserListReq,
	UserListResp,
	UserResp,
	UserUpdateBanReq,
	UserUpdatePasswordReq,
	UserUpdateReq,
} from "fuxiaochen-types";

const API_BASE_PATH = "/api/v1/users";

/** 获取当前登录用户信息 */
export async function getUserInfo(): Promise<CommonResponse<UserResp>> {
	const res = await request.get<CommonResponse<UserResp>>(
		`${API_BASE_PATH}/info`
	);
	return res.data;
}

/** 获取用户列表 */
export async function getUserList(req: UserListReq) {
	const res = await request.get<CommonResponse<UserListResp>>(API_BASE_PATH, {
		params: req,
	});
	return res.data;
}

/** 获取用户详情 */
export async function getUserDetail(UserID: string) {
	const res = await request.get<CommonResponse<UserResp>>(
		`${API_BASE_PATH}/${UserID}`
	);
	return res.data;
}

/** 创建用户 */
export async function createUser(req: UserCreateReq) {
	const res = await request.post<CommonResponse<UserResp>>(
		API_BASE_PATH,
		req
	);
	return res.data;
}

/** 更新用户 */
export async function updateUser(UserID: string, req: UserUpdateReq) {
	const res = await request.put<CommonResponse<void>>(
		`${API_BASE_PATH}/${UserID}`,
		req
	);
	return res.data;
}

/** 删除用户 */
export async function deleteUser(UserID: string) {
	const res = await request.delete<CommonResponse<void>>(
		`${API_BASE_PATH}/${UserID}`
	);
	return res.data;
}

/** 更新用户密码 */
export async function updateUserPassword(
	UserID: string,
	req: UserUpdatePasswordReq
) {
	const res = await request.patch<CommonResponse<void>>(
		`${API_BASE_PATH}/${UserID}/password`,
		req
	);
	return res.data;
}

/** 更新用户禁用状态 */
export async function updateUserBan(UserID: string, req: UserUpdateBanReq) {
	const res = await request.patch<CommonResponse<void>>(
		`${API_BASE_PATH}/${UserID}/ban`,
		req
	);
	return res.data;
}

/** 退出登录 */
export async function logout() {
	const res = await request.post<CommonResponse<void>>(
		`${API_BASE_PATH}/logout`
	);
	return res.data;
}
