import {
  handleAdminGetSettings,
  handleAdminUpdateSettings,
} from "@/lib/server/settings/handler";

export function GET(request: Request) {
  return handleAdminGetSettings(request);
}

export function PATCH(request: Request) {
  return handleAdminUpdateSettings(request);
}
