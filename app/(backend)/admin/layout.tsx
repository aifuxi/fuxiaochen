import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { SESSION_COOKIE, validSession } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!validSession(session)) redirect("/login");

  return <AdminWorkspace>{children}</AdminWorkspace>;
}
