import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(1, "请输入用户名")
  .max(128, "用户名不能超过 128 个字符");
export const newPasswordSchema = z
  .string()
  .min(15, "密码至少需要 15 个字符")
  .max(128, "密码不能超过 128 个字符");
export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "请输入密码").max(128, "密码不能超过 128 个字符"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
