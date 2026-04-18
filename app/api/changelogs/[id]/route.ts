import {
  handleDeleteChangelog,
  handleGetChangelog,
  handleUpdateChangelog,
} from "@/lib/server/changelogs/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetChangelog(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdateChangelog(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleDeleteChangelog(request, params);
}
