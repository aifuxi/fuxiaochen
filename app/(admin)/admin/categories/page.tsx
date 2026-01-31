import { headers } from "next/headers";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import CategoryManagementPage from "./category-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <CategoryManagementPage role={session?.user?.role} />
    </Suspense>
  );
}
