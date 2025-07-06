import { z } from "zod";

export const registerSchema = z.object({
  nickname: z.string().min(2, { message: "至少2个字符" }),
  email: z.string().email().min(1, { message: "至少6个字符" }),
  password: z.string().min(1, { message: "至少6个字符" }),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "非法的邮箱" })
    .min(6, { message: "至少6个字符" }),
  password: z.string().min(6, { message: "至少6个字符" }),
});

export type LoginRequest = z.infer<typeof loginSchema>;
