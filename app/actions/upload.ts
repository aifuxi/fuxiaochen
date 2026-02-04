"use server";

import { checkAdmin } from "@/lib/auth-guard";
import { uploadStore } from "@/stores/upload";

export async function getPresignUploadInfo(uploadFileName: string) {
  try {
    await checkAdmin();
    const result = await uploadStore.getPresignUploadInfo(uploadFileName);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
