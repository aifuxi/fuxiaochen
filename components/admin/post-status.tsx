"use client";
import { Button } from "@/components/ui/button";

export function PostQueryStatus({
  loading,
  error,
  reload,
}: {
  loading: boolean;
  error: string;
  reload: () => void;
}) {
  if (loading) return <output className="admin-muted admin-post-feedback">正在加载文章…</output>;
  if (!error) return null;
  return (
    <div className="admin-post-feedback" role="alert">
      <p className="admin-post-error">{error}</p>
      <Button variant="secondary" size="sm" onClick={reload}>
        重新加载
      </Button>
    </div>
  );
}
