"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type ChangelogCreateReq,
  type ChangelogListReq,
} from "@/types/changelog";
import { checkAdmin } from "@/lib/auth-guard";
import { changelogStore } from "@/stores/changelog";

const changelogListReqSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(10),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  version: z.string().trim().optional(),
});

const changelogIdSchema = z.string().trim();
const changelogCreateReqSchema = z.object({
  version: z.string().trim(),
  content: z.string().trim(),
  date: z.coerce.number().int().optional(),
});

export async function getChangelogsAction(params?: ChangelogListReq) {
  try {
    const parsed = changelogListReqSchema.safeParse(params ?? {});
    if (!parsed.success) {
      return { success: false, error: "参数错误" };
    }
    const result = await changelogStore.findAll(parsed.data as ChangelogListReq);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getChangelogByIdAction(id: string) {
  try {
    const parsedId = changelogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

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
    const parsedData = changelogCreateReqSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await changelogStore.create(parsedData.data);
    revalidatePath("/changelog");
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "操作失败";
    return { success: false, error: message };
  }
}

export async function updateChangelogAction(
  id: string,
  data: Partial<ChangelogCreateReq>,
) {
  try {
    const parsedId = changelogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }
    const parsedData = changelogCreateReqSchema.partial().safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await changelogStore.update(id, parsedData.data);
    revalidatePath("/changelog");
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "操作失败";
    return { success: false, error: message };
  }
}

export async function deleteChangelogAction(id: string) {
  try {
    const parsedId = changelogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    await changelogStore.delete(id);
    revalidatePath("/changelog");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "操作失败";
    return { success: false, error: message };
  }
}
