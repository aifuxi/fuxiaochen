import {
  handleAdminCreateChangelog,
  handleAdminListChangelogs,
} from "@/lib/server/changelogs/handler";

export function GET(request: Request) {
  return handleAdminListChangelogs(request);
}

export function POST(request: Request) {
  return handleAdminCreateChangelog(request);
}
