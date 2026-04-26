import { handlePublicListTags } from "@/lib/server/tags/handler";

export function GET() {
  return handlePublicListTags();
}
