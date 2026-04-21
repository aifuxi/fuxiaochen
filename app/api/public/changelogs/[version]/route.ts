import { handlePublicGetChangelog } from "@/lib/server/changelogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ version: string }> },
) {
  return handlePublicGetChangelog(request, params);
}
