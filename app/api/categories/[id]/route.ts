import {
  handleDeleteCategory,
  handleGetCategory,
  handleUpdateCategory,
} from "@/lib/server/categories/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleGetCategory(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdateCategory(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleDeleteCategory(request, params);
}
