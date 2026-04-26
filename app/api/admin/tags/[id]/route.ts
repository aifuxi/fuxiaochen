import {
  handleAdminDeleteTag,
  handleAdminGetTag,
  handleAdminUpdateTag,
} from "@/lib/server/tags/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminGetTag(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateTag(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminDeleteTag(request, params);
}
