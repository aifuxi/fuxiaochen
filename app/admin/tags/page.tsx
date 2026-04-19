import { Suspense } from "react";

import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Tags",
  description: "Manage tag records in the admin interface.",
};

export default function AdminTagsPage() {
  return (
    <Suspense fallback={<AdminTagsPageFallback />}>
      <AdminResourcePage
        resource="tags"
        title="Tags"
        description="维护标签，供文章多选关联使用。"
      />
    </Suspense>
  );
}

function AdminTagsPageFallback() {
  return (
    <main className="shell-page pt-32 pb-24">
      <section className="ui-panel p-8">
        <p className="ui-meta">Loading</p>
        <p className="mt-4 text-base leading-7 text-text-base">
          正在加载 tags 数据...
        </p>
      </section>
    </main>
  );
}
