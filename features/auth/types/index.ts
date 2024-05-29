import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, { message: "长度不能少于1个字符" }),
  email: z.string().email().min(1, { message: "长度不能少于1个字符" }),
  password: z.string().min(1, { message: "长度不能少于1个字符" }),
});

export type SignupDTO = z.infer<typeof signupSchema>;

export const signInSchema = z.object({
  email: z.string().email().min(1, { message: "长度不能少于1个字符" }),
  password: z.string().min(1, { message: "长度不能少于1个字符" }),
});

export type SignInDTO = z.infer<typeof signInSchema>;
