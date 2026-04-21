import {
  handleAdminDeleteChangelog,
  handleAdminGetChangelog,
  handleAdminUpdateChangelog,
} from "@/lib/server/changelogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminGetChangelog(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateChangelog(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminDeleteChangelog(request, params);
}
