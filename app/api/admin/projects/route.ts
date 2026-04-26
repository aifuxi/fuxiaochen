import {
  handleAdminCreateProject,
  handleAdminListProjects,
} from "@/lib/server/projects/handler";

export function GET(request: Request) {
  return handleAdminListProjects(request);
}

export function POST(request: Request) {
  return handleAdminCreateProject(request);
}
