"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useAdminWorkspace } from "./admin-context";

export function TaxonomyStatus() {
  const { taxonomyLoading, taxonomyError, taxonomyPending, reloadTaxonomy } = useAdminWorkspace();
  if (taxonomyLoading) return <output className="admin-muted">正在加载分类与标签…</output>;
  if (!taxonomyError) return null;
  return (
    <div role="alert">
      <p>{taxonomyError}</p>
      <Button type="button" disabled={taxonomyPending} onClick={() => void reloadTaxonomy()}>
        重新加载
      </Button>
      {taxonomyError.includes("登录") && <Link href="/login">重新登录</Link>}
    </div>
  );
}
