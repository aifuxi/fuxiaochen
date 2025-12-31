import request from "@/libs/request";
import type { CommonResponse } from "./common";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

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
