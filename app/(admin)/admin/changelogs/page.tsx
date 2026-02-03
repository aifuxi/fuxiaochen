import { headers } from "next/headers";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import ChangelogManagementPage from "./changelog-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <ChangelogManagementPage role={session?.user?.role} />
    </Suspense>
  );
}
