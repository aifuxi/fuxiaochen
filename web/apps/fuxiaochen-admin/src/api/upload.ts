import axios from "axios";
import type { CommonResponse, PresignUploadInfoResp } from "fuxiaochen-types";

import request from "@/libs/request";

const API_BASE_PATH = "/api/v1/upload";

export async function uploadFile(file: File) {
  const res = await request.post<CommonResponse<PresignUploadInfoResp>>(
    `${API_BASE_PATH}/presign`,
    { name: file.name },
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
