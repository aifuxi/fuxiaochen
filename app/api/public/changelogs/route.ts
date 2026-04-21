import { handlePublicListChangelogs } from "@/lib/server/changelogs/handler";

export function GET(request: Request) {
  return handlePublicListChangelogs(request);
}
