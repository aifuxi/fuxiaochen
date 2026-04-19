import { Suspense } from "react";

import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Posts",
  description: "Manage posts in the admin table and drawer workflow.",
};

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<AdminPostsPageFallback />}>
      <AdminResourcePage
        resource="blogs"
        title="Posts"
        description="维护文章内容、分类、标签与发布状态。"
      />
    </Suspense>
  );
}

function AdminPostsPageFallback() {
  return (
    <main className="shell-page pt-32 pb-24">
      <section className="ui-panel p-8">
        <p className="ui-meta">Loading</p>
        <p className="mt-4 text-base leading-7 text-text-base">
          正在加载 posts 数据...
        </p>
      </section>
    </main>
  );
}
