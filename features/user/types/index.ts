import { type User as DbUser } from "@prisma/client";
import { z } from "zod";

import { type BaseResponse } from "@/types";

import { ROLES } from "@/constants";

export const getUsersSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),

  pageIndex: z.coerce.number(),
  pageSize: z.coerce.number(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type GetUsersRequest = z.infer<typeof getUsersSchema>;

export type User = DbUser;

export type UserOmitPassword = Omit<User, "password">;

export type GetUsersData = {
  users: UserOmitPassword[];
  total: number;
};

export type GetUsersResponse = BaseResponse<GetUsersData>;

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "长度不能少于1个字符" }),
  email: z.string().email().min(1, { message: "长度不能少于1个字符" }),
  role: z.enum([ROLES.admin, ROLES.visitor], { message: "非法的角色" }),
  password: z.string().min(1, { message: "长度不能少于1个字符" }),
});

export type CreateUserData = UserOmitPassword;

export type GetUserData = UserOmitPassword;

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export type CreateUserResponse = BaseResponse<CreateUserData>;

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "长度不能少于1个字符" }),
  email: z.string().email().min(1, { message: "长度不能少于1个字符" }),
  role: z.enum([ROLES.admin, ROLES.visitor], { message: "非法的角色" }),
  password: z.string().optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export type UpdateUserData = UserOmitPassword;

export type UpdateUserResponse = BaseResponse<UpdateUserData>;
