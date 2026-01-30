"use server";

import { revalidatePath } from "next/cache";

import { TagCreateReq, TagListReq } from "@/types/tag";

import { tagStore } from "@/stores/tag";

export async function getTagsAction(params?: TagListReq) {
  try {
    const result = await tagStore.findAll(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTagByIdAction(id: string) {
  try {
    const result = await tagStore.findById(id);
    if (!result) {
      return { success: false, error: "Tag not found" };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTagAction(data: TagCreateReq) {
  try {
    const result = await tagStore.create(data);
    revalidatePath("/tags");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTagAction(id: string, data: Partial<TagCreateReq>) {
  try {
    const result = await tagStore.update(id, data);
    revalidatePath("/tags");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await tagStore.delete(id);
    revalidatePath("/tags");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
