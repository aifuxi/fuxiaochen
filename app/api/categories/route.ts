import {
  handleCreateCategory,
  handleListCategories,
} from "@/lib/server/categories/handler";

export function GET(request: Request) {
  return handleListCategories(request);
}

export function POST(request: Request) {
  return handleCreateCategory(request);
}
