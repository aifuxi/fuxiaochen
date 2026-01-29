import { NextRequest } from "next/server";

import ossClient from "@/lib/oss";
import { businessError, paramError, success } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) return paramError("Filename required");

    const uploadDir = process.env.OSS_UPLOAD_DIR || "upload";
    const filename = `${uploadDir}/${name}`;

    // Generate presigned URL for PUT
    const url = ossClient.signatureUrl(filename, {
      method: "PUT",
      "Content-Type": "application/octet-stream",
      expires: 600, // 10 minutes
    });

    // The generated URL is the full upload URL.
    // Go code returns: URL (without query?), Name, SignedHeaders, UploadURL (full).
    // Frontend likely uses UploadURL to PUT.

    return success({
      uploadUrl: url,
      name,
      // ali-oss signatureUrl usually includes query params for signature.
      // If frontend needs clean URL for access, it's just bucket domain + key.
      // But ali-oss SDK client helper `signatureUrl` returns the signed URL.
      // We can infer public URL.
    });
  } catch (e: any) {
    return businessError(e.message);
  }
}
