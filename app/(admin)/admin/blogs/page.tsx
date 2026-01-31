import { Suspense } from "react";

import BlogManagementPage from "./blog-list";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <BlogManagementPage />
    </Suspense>
  );
}
