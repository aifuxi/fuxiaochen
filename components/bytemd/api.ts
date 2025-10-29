import {
  type GetUploadInfoData,
  type GetUploadInfoRequest,
} from "@/types/upload";

import { request } from "@/lib/request";

export function getUploadInfo(params: GetUploadInfoRequest) {
  return request.get<unknown, GetUploadInfoData>("/upload-info", {
    params,
  });
}
