import { handleCreateTag, handleListTags } from "@/lib/server/tags/handler";

export function GET(request: Request) {
  return handleListTags(request);
}

export function POST(request: Request) {
  return handleCreateTag(request);
}
