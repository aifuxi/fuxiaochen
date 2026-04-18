import {
  handleCreateChangelog,
  handleListChangelogs,
} from "@/lib/server/changelogs/handler";

export function GET(request: Request) {
  return handleListChangelogs(request);
}

export function POST(request: Request) {
  return handleCreateChangelog(request);
}
