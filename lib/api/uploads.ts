import { fileTypeFromBlob } from "file-type";

import { apiRequest } from "@/lib/api/fetcher";

export type UploadUsage =
  | "blog-cover"
  | "site-logo"
  | "site-avatar"
  | "friend-avatar"
  | "general-image";

export type UploadImageResult = {
  uploadUrl: string;
  fileUrl: string;
  objectKey: string;
  headers: Record<string, string>;
};

export async function uploadImageToOss(file: File, usage: UploadUsage) {
  const detectedType = await fileTypeFromBlob(file);

  if (!detectedType) {
    throw new Error("无法识别文件类型，请选择有效的图片文件");
  }

  const payload = await apiRequest<UploadImageResult>(
    "/api/admin/uploads/presign",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: detectedType.mime,
        extension: detectedType.ext,
        usage,
      }),
      errorFallback: "生成上传凭证失败",
      errorSource: "图片上传",
      toastOnError: false,
    },
  );
  const uploadResult = payload.data;
  const response = await fetch(uploadResult.uploadUrl, {
    method: "PUT",
    headers: uploadResult.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error(`上传图片失败，OSS 返回 ${response.status}`);
  }

  return uploadResult;
}
