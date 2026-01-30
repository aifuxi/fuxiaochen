import { Suspense } from "react";

import UserManagementPage from "./user-list";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <UserManagementPage />
    </Suspense>
  );
}
