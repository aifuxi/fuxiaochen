import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import BlogManagementPage from "./blog-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Suspense fallback={<div className="text-primary-foreground">Loading...</div>}>
      <BlogManagementPage />
    </Suspense>
  );
}
