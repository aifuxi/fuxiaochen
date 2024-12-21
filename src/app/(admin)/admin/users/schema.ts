import { Role } from "@prisma/client";
import { z } from "zod";

export const getUsersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  page: z.number().min(1, { message: "page最小为1" }),
  pageSize: z
    .number()
    .min(5, { message: "pageSize最小为10" })
    .max(50, { message: "pageSize最大为50" }),
});

export type GetUsersRequestType = z.infer<typeof getUsersSchema>;

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "昵称必填" }),
  email: z.string().min(1, { message: "邮箱必填" }).email("邮箱格式错误"),
  role: z.enum([Role.ADMIN, Role.USER]),
  password: z
    .string()
    .min(1, { message: "密码必填" })
    .max(20, { message: "密码长度超过20" }),
});

export type CreateUserRequestType = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, { message: "昵称必填" }),
  email: z.string().min(1, { message: "邮箱必填" }).email("邮箱格式错误"),
  role: z.enum([Role.ADMIN, Role.USER]),
});

export type UpdateUserRequestType = z.infer<typeof updateUserSchema>;

export type UpdateUserBannedRequestType = {
  id: number;
  banned: boolean;
};
