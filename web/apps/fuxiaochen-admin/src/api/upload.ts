import request from "@/libs/request";
import type { CommonResponse } from "./common";
import axios from "axios";

export interface PresignUploadInfoResp {
  url: string;
  name: string;
  uploadUrl: string;
  signedHeaders: Record<string, string>;
}

const API_BASE_PATH = "/api/v1/upload";

export interface UploadFileResp {
  url: string;
  name: string;
}

export async function uploadFile(file: File) {
  const res = await request.post<CommonResponse<PresignUploadInfoResp>>(
    `${API_BASE_PATH}/presign`,
    { name: file.name }
  );

  const uploadInfo = res.data.data;

  await axios.put(uploadInfo.uploadUrl, file, {
    headers: uploadInfo.signedHeaders,
  });

  return {
    url: uploadInfo.url,
    name: uploadInfo.name,
  };
}
