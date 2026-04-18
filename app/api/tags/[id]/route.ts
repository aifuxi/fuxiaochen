import {
  handleDeleteTag,
  handleGetTag,
  handleUpdateTag,
} from "@/lib/server/tags/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetTag(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdateTag(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleDeleteTag(request, params);
}
