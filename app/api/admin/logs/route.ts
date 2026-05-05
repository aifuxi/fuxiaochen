import { handleAdminListApiTimingLogs } from "@/lib/server/api-logs/handler";

export function GET(request: Request) {
  return handleAdminListApiTimingLogs(request);
}
