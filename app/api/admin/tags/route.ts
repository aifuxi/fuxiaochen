import {
  handleAdminCreateTag,
  handleAdminListTags,
} from "@/lib/server/tags/handler";

export function GET(request: Request) {
  return handleAdminListTags(request);
}

export function POST(request: Request) {
  return handleAdminCreateTag(request);
}
