"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type TagCreateReq, type TagListReq } from "@/types/tag";
import { checkAdmin } from "@/lib/auth-guard";
import { tagStore } from "@/stores/tag";

const tagListReqSchema = z.object({
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
  slug: z.string().trim().optional(),
});

const tagIdSchema = z.string().trim();
const tagCreateReqSchema = z.object({
  name: z.string().trim(),
  slug: z.string().trim(),
});

export async function getTagsAction(params?: TagListReq) {
  try {
    const parsed = tagListReqSchema.safeParse(params ?? {});
    if (!parsed.success) {
      return { success: false, error: "参数错误" };
    }
    const result = await tagStore.findAll(parsed.data as TagListReq);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTagByIdAction(id: string) {
  try {
    const parsedId = tagIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

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
    const parsedData = tagCreateReqSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await tagStore.create(parsedData.data);
    revalidatePath("/admin/tags");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTagAction(id: string, data: Partial<TagCreateReq>) {
  try {
    const parsedId = tagIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }
    const parsedData = tagCreateReqSchema.partial().safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await tagStore.update(id, parsedData.data);
    revalidatePath("/admin/tags");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTagAction(id: string) {
  try {
    const parsedId = tagIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    await tagStore.delete(id);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
