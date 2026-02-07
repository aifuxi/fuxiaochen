"use server";

import { uploadStore } from "@/stores/upload";

export async function getPresignUploadInfo(uploadFileName: string) {
  try {
    const result = await uploadStore.getPresignUploadInfo(uploadFileName);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
