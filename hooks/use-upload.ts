import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/request";

interface PresignResponse {
  uploadUrl: string;
  name: string;
}

export function useUpload() {
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File) => {
    setLoading(true);
    try {
      // 1. Get Presigned URL
      const presign = await api.post<PresignResponse>("/upload/presign", {
        name: file.name,
      });

      // 2. Upload to OSS using PUT
      // Note: The uploadUrl from ali-oss signatureUrl might contain query params.
      // We should use it directly.
      const response = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // 3. Return the clean URL (without query params)
      // Assuming presign.uploadUrl is like https://bucket.endpoint/key?signature...
      const urlObj = new URL(presign.uploadUrl);
      const cleanUrl = `${urlObj.origin}${urlObj.pathname}`;

      return {
        name: presign.name,
        url: cleanUrl,
      };
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading };
}
