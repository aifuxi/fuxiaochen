import { handlePublicListCategories } from "@/lib/server/categories/handler";

export function GET(request: Request) {
  return handlePublicListCategories(request);
}
