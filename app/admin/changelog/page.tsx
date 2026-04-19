import { Suspense } from "react";

import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Changelog",
  description: "Manage changelog records in the admin interface.",
};

export default function AdminChangelogPage() {
  return (
    <Suspense fallback={<AdminChangelogPageFallback />}>
      <AdminResourcePage
        resource="changelogs"
        title="Changelog"
        description="维护版本号、发布日期和 changelog 文本内容。"
      />
    </Suspense>
  );
}

function AdminChangelogPageFallback() {
  return (
    <main className="shell-page pt-32 pb-24">
      <section className="ui-panel p-8">
        <p className="ui-meta">Loading</p>
        <p className="mt-4 text-base leading-7 text-text-base">
          正在加载 changelog 数据...
        </p>
      </section>
    </main>
  );
}
