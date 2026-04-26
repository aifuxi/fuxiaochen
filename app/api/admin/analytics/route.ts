import { handleAdminGetAnalytics } from "@/lib/server/analytics/handler";

export function GET(request: Request) {
  return handleAdminGetAnalytics(request);
}
