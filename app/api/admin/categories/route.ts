import {
  handleAdminCreateCategory,
  handleAdminListCategories,
} from "@/lib/server/categories/handler";

export function GET(request: Request) {
  return handleAdminListCategories(request);
}

export function POST(request: Request) {
  return handleAdminCreateCategory(request);
}
