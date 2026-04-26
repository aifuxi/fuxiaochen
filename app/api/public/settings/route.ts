import { handlePublicGetSettings } from "@/lib/server/settings/handler";

export function GET() {
  return handlePublicGetSettings();
}
