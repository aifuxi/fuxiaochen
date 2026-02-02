import { type PresignUploadInfoResp } from "@/types/upload";

export interface IUploadStore {
  getPresignUploadInfo(uploadFileName: string): Promise<PresignUploadInfoResp>;
}
