import { type PresignUploadInfoResp } from "@/types/upload";
import { aliOSS } from "@/lib/oss";
import { type IUploadStore } from "./interface";

export class UploadStore implements IUploadStore {
  async getPresignUploadInfo(
    uploadFileName: string,
  ): Promise<PresignUploadInfoResp> {
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
    };

    const filename = `${process.env.OSS_UPLOAD_DIR || ""}/${Date.now()}_${uploadFileName}`;
    const uploadPath = `${process.env.OSS_UPLOAD_DIR || ""}/${filename}`;

    const signatureUrl = await aliOSS.signatureUrlV4(
      "PUT",
      3600,
      { headers },
      uploadPath,
    );

    return {
      url: signatureUrl.split("?")[0] || signatureUrl,
      name: filename,
      uploadUrl: signatureUrl,
      signedHeaders: headers,
    };
  }
}
