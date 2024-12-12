import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, { message: "昵称必填" }),
  email: z.string().min(1, { message: "邮箱必填" }).email("邮箱格式错误"),
  password: z
    .string()
    .min(1, { message: "密码必填" })
    .max(20, { message: "密码长度超过20" }),
});

export type RegisterRequestType = z.infer<typeof registerSchema>;
