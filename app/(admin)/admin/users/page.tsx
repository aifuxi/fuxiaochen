import { Suspense } from "react";
import { headers } from "next/headers";
import { GlassCard } from "@/components/ui/glass-card";
import { auth } from "@/lib/auth";
import UserManagementPage from "./user-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== "admin") {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <GlassCard className="flex flex-col items-center space-y-4 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-widest text-red-500 uppercase">
            拒绝访问
          </h2>
          <p className="text-[var(--text-color-secondary)]">
            没有权限查看此页面
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <Suspense
      fallback={<div className="text-[var(--text-color)]">Loading...</div>}
    >
      <UserManagementPage />
    </Suspense>
  );
}
