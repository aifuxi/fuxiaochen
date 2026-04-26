import { handlePublicListCategories } from "@/lib/server/categories/handler";

export function GET() {
  return handlePublicListCategories();
}
