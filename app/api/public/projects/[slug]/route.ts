import { handlePublicGetProject } from "@/lib/server/projects/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return handlePublicGetProject(request, params);
}
