"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
export function BusinessStatus({
  loading,
  error,
  reload,
}: {
  loading: boolean;
  error: string;
  reload: () => void;
}) {
  if (loading) return <output className="admin-business-feedback">正在加载…</output>;
  if (!error) return null;
  return (
    <div className="admin-business-feedback" role="alert">
      <p className="admin-business-error">{error}</p>
      <Button type="button" size="sm" variant="secondary" onClick={reload}>
        重新加载
      </Button>
      {error.includes("登录") && <Link href="/login">重新登录</Link>}
    </div>
  );
}
