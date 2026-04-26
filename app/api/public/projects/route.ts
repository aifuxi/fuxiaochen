import { handlePublicListProjects } from "@/lib/server/projects/handler";

export function GET(request: Request) {
  return handlePublicListProjects(request);
}
