import { Suspense } from "react";

import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Categories",
  description: "Manage category records in the admin interface.",
};

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<AdminCategoriesPageFallback />}>
      <AdminResourcePage
        resource="categories"
        title="Categories"
        description="维护文章分类，保持 slug 和描述的一致性。"
      />
    </Suspense>
  );
}

function AdminCategoriesPageFallback() {
  return (
    <main className="shell-page pt-32 pb-24">
      <section className="ui-panel p-8">
        <p className="ui-meta">Loading</p>
        <p className="mt-4 text-base leading-7 text-text-base">
          正在加载 categories 数据...
        </p>
      </section>
    </main>
  );
}
