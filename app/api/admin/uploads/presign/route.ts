import { handleAdminCreatePresignedUploadUrl } from "@/lib/server/uploads/handler";

export function POST(request: Request) {
  return handleAdminCreatePresignedUploadUrl(request);
}
