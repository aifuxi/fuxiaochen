"use client";

import { useEffect } from "react";

import { useAdminWorkspace } from "./admin-context";
import { PostEditor } from "./post-editor";
import "./editor/editor.css";

export function AdminPostEditor({ id = null }: { id?: string | null }) {
  const { setWritingFocused } = useAdminWorkspace();
  useEffect(() => {
    setWritingFocused(false);
    return () => setWritingFocused(false);
  }, [setWritingFocused]);

  return <PostEditor key={id ?? "new"} id={id} />;
}
