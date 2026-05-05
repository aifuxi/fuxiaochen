import { handlePublicGetSettings } from "@/lib/server/settings/handler";

export function GET(request: Request) {
  return handlePublicGetSettings(request);
}
