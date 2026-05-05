import { handlePublicListTags } from "@/lib/server/tags/handler";

export function GET(request: Request) {
  return handlePublicListTags(request);
}
