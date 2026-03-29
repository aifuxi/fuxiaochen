"use server";

import { z } from "zod";
import { checkAdmin } from "@/lib/auth-guard";
import { uploadStore } from "@/stores/upload";

const uploadFileNameSchema = z.string().trim();

export async function getPresignUploadInfo(uploadFileName: string) {
  try {
    const parsedName = uploadFileNameSchema.safeParse(uploadFileName);
    if (!parsedName.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await uploadStore.getPresignUploadInfo(parsedName.data);
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "操作失败";
    return { success: false, error: message };
  }
}
