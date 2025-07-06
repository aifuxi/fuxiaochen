import { z } from "zod";

import { request } from "@/lib/request";

export const registerSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: "至少2个字符" })
    .max(18, { message: "至多18个字符" }),
  email: z
    .string()
    .email()
    .min(1, { message: "至少6个字符" })
    .max(30, { message: "至多30个字符" }),
  password: z
    .string()
    .min(1, { message: "至少6个字符" })
    .max(18, { message: "至多18个字符" }),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export interface RegisterResponse {
  email: string;
}

export function register(data: RegisterRequest) {
  return request.post<RegisterResponse>("/api/auth/register", data);
}

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "非法的邮箱" })
    .min(6, { message: "至少6个字符" })
    .max(30, { message: "至多30个字符" }),
  password: z
    .string()
    .min(6, { message: "至少6个字符" })
    .max(18, { message: "至多18个字符" }),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export interface LoginResponse {
  token: string;
}

export function login(data: LoginRequest) {
  return request.post<LoginResponse>("/api/auth/login", data);
}
