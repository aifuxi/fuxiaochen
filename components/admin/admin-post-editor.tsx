"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { postIdSchema } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { PostEditor } from "./post-editor";
import "./editor/editor.css";

export function AdminPostEditor({ id = null }: { id?: string | null }) {
  const pathname = usePathname();
  const pathId = postIdSchema.safeParse({
    id: /^\/admin\/posts\/([^/]+)\/edit$/.exec(pathname)?.[1],
  });
  // 原生历史恢复可能复用新建页；只在挂载时读取已保存文章的公开地址。
  const [initialPathId] = useState(() => (pathId.success ? pathId.data.id : null));
  const editorId = id ?? initialPathId;
  const { setWritingFocused } = useAdminWorkspace();
  useEffect(() => {
    setWritingFocused(false);
    return () => setWritingFocused(false);
  }, [setWritingFocused]);

  return <PostEditor key={editorId ?? "new"} id={editorId} />;
}
