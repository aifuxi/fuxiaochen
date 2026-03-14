import { Suspense } from "react";
import ChangelogManagementPage from "./changelog-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<div className="text-primary-foreground">Loading...</div>}>
      <ChangelogManagementPage />
    </Suspense>
  );
}
