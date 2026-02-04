"use server";

import { revalidatePath } from "next/cache";
import {
  type ChangelogCreateReq,
  type ChangelogListReq,
} from "@/types/changelog";
import { checkAdmin } from "@/lib/auth-guard";
import { changelogStore } from "@/stores/changelog";

export async function getChangelogsAction(params?: ChangelogListReq) {
  try {
    const result = await changelogStore.findAll(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getChangelogByIdAction(id: string) {
  try {
    const result = await changelogStore.findById(id);
    if (!result) {
      return { success: false, error: "Changelog not found" };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createChangelogAction(data: ChangelogCreateReq) {
  try {
    await checkAdmin();
    const result = await changelogStore.create(data);
    revalidatePath("/changelog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateChangelogAction(
  id: string,
  data: Partial<ChangelogCreateReq>,
) {
  try {
    await checkAdmin();
    const result = await changelogStore.update(id, data);
    revalidatePath("/changelog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteChangelogAction(id: string) {
  try {
    await checkAdmin();
    await changelogStore.delete(id);
    revalidatePath("/changelog");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
