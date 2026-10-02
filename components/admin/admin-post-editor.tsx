"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useAdminWorkspace } from "./admin-context";
import { PostEditor } from "./post-editor";
import "./editor/editor.css";

export function AdminPostEditor({ id = null }: { id?: string | null }) {
  const router = useRouter();
  const { postPending } = useAdminWorkspace();
  const returnToPosts = () => router.push("/admin/posts");

  return (
    <div className="admin-post-editor-page">
      <div className="admin-page-heading">
        <div>
          <h1>{id ? "编辑文章" : "新建文章"}</h1>
          <p>编辑文章内容与发布设置，排期到期后需手动发布。</p>
        </div>
        <Button variant="ghost" size="compact" disabled={postPending} onClick={returnToPosts}>
          <ArrowLeft size={16} aria-hidden="true" />
          返回文章列表
        </Button>
      </div>
      <PostEditor key={id ?? "new"} id={id} onClose={returnToPosts} />
    </div>
  );
}
