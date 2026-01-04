import request from "@/libs/request";
import type {
	LoginRequest,
	LoginResponse,
	CommonResponse,
} from "fuxiaochen-types";

/** 登录 */
export async function login(
	data: LoginRequest
): Promise<CommonResponse<LoginResponse>> {
	const res = await request.post<CommonResponse<LoginResponse>>(
		"/api/v1/auth/login",
		data
	);
	return res.data;
}
