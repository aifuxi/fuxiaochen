import { useMutation } from "@tanstack/react-query";
import { type z } from "zod";

import { request } from "@/lib/request";

import { type loginSchema, type registerSchema } from "./schema";

export type RegisterRequest = z.infer<typeof registerSchema>;

export interface RegisterResponse {
  email: string;
}

export function register(data: RegisterRequest) {
  return request.post<RegisterResponse>("/api/auth/register", data);
}

export type LoginRequest = z.infer<typeof loginSchema>;

export interface LoginResponse {
  token: string;
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post("/api/auth/login", data);
}

export function useAuthLogin() {
  return useMutation({
    mutationKey: ["auth/login"],
    mutationFn: login,
  });
}

export function useAuthRegister() {
  return useMutation({
    mutationKey: ["auth/register"],
    mutationFn: register,
  });
}
