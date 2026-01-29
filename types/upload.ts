export interface PresignUploadInfoResp {
  url: string;
  name: string;
  uploadUrl: string;
  signedHeaders: Record<string, string>;
}


export interface UploadFileResp {
  url: string;
  name: string;
}

