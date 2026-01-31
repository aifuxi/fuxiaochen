import { headers } from "next/headers";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import BlogManagementPage from "./blog-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <BlogManagementPage role={session?.user?.role} />
    </Suspense>
  );
}
