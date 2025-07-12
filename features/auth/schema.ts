import { z } from "zod";

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
