import { Suspense } from "react";

import { AdminTagListPage } from "@/features/admin";

export default function Page() {
  return (
    <Suspense>
      <AdminTagListPage />
    </Suspense>
  );
}
