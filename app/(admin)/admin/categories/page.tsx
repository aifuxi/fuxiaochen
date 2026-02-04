import { Suspense } from "react";
import CategoryManagementPage from "./category-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <CategoryManagementPage />
    </Suspense>
  );
}
