import { Suspense } from "react";
import CategoryManagementPage from "./category-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<div className="text-primary-foreground">Loading...</div>}>
      <CategoryManagementPage />
    </Suspense>
  );
}
