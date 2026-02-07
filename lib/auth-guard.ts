import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user?.role !== "admin") {
    throw new Error("无权限进行此操作");
  }
  return session;
}
