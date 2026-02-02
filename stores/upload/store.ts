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

    const filename = `${process.env.OSS_UPLOAD_DIR || ""}/${uploadFileName}`;

    const signatureUrl = await aliOSS.signatureUrlV4(
      "PUT",
      3600,
      { headers },
      filename,
    );

    return {
      url: signatureUrl.split("?")[0] || signatureUrl,
      name: uploadFileName,
      uploadUrl: signatureUrl,
      signedHeaders: headers,
    };
  }
}
