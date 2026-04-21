import {
  handleAdminDeleteCategory,
  handleAdminGetCategory,
  handleAdminUpdateCategory,
} from "@/lib/server/categories/handler";

export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminGetCategory(request, params);
}

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminUpdateCategory(request, params);
}

export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleAdminDeleteCategory(request, params);
}
