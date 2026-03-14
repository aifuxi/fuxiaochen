import { Suspense } from "react";
import TagManagementPage from "./tag-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<div className="text-primary-foreground">Loading...</div>}>
      <TagManagementPage />
    </Suspense>
  );
}
