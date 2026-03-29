"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type UserListReq, type UserUpdateReq } from "@/types/user";
import { checkAdmin } from "@/lib/auth-guard";
import { userStore } from "@/stores/user";

const userListReqSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(10),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  name: z.string().trim().optional(),
  email: z.string().trim().optional(),
  role: z.coerce.number().int().optional(),
});

const userIdSchema = z.string().trim();
const userUpdateReqSchema = z.object({
  role: z.coerce.number().int(),
});

export async function getUsersAction(params?: UserListReq) {
  try {
    await checkAdmin();
    const parsed = userListReqSchema.safeParse(params ?? {});
    if (!parsed.success) {
      return { success: false, error: "参数错误" };
    }
    const result = await userStore.findAll(parsed.data as UserListReq);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserByIdAction(id: string) {
  try {
    const parsedId = userIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await userStore.findById(id);
    if (!result) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserAction(id: string, data: UserUpdateReq) {
  try {
    const parsedId = userIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }
    const parsedData = userUpdateReqSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await userStore.update(id, parsedData.data);
    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const parsedId = userIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    await userStore.delete(id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
