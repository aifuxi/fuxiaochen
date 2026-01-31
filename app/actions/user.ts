"use server";

import { revalidatePath } from "next/cache";
import { UserListReq, UserUpdateReq } from "@/types/user";
import { checkAdmin } from "@/lib/auth-guard";
import { userStore } from "@/stores/user";

export async function getUsersAction(params?: UserListReq) {
  try {
    await checkAdmin();
    const result = await userStore.findAll(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserByIdAction(id: string) {
  try {
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
    await checkAdmin();
    const result = await userStore.update(id, data);
    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await checkAdmin();
    await userStore.delete(id);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
