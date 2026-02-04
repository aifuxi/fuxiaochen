import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import UserManagementPage from "./user-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== "admin") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-widest text-neon-magenta uppercase">
          拒绝访问
        </h2>
        <p className="text-gray-400">没有权限查看此页面</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <UserManagementPage />
    </Suspense>
  );
}
