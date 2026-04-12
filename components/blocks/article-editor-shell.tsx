"use client";

import { startTransition, useState } from "react";
import { toast } from "sonner";

import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { MarkdownViewer } from "@/components/editor/markdown-viewer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextareaField } from "@/components/ui/form-field";

type ArticleEditorShellProps = {
  initialValue: string;
};

export function ArticleEditorShell({ initialValue }: ArticleEditorShellProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [status, setStatus] = useState("draft");

  return (
    <div className={`
      grid gap-6
      xl:grid-cols-[22rem_1fr]
    `}>
      <aside className="space-y-5 rounded-[1.8rem] border border-white/8 bg-white/3 p-5">
        <div className="type-label">文章设置</div>
        <TextField label="标题" name="title" placeholder="构建一个简洁的 CMS" />
        <TextField label="Slug" name="slug" placeholder="building-a-calm-cms" />
        <TextareaField
          defaultValue="关于界面节奏和 CMS 人体工程学的简洁编辑笔记。"
          description="用于归档卡片和社交预览。"
          label="摘要"
          name="excerpt"
          placeholder="简短摘要"
        />
        <Select
          options={[
            { label: "草稿", value: "draft" },
            { label: "待审核", value: "review" },
            { label: "已发布", value: "published" },
          ]}
          value={status}
          onValueChange={(value) => setStatus(value as string)}
        />
        <div className="grid gap-3">
          <Button
            className="w-full justify-center"
            onClick={() =>
              startTransition(() => {
                toast.success("草稿已保存", { description: `状态: ${status}` });
              })
            }
            type="button"
          >
            保存草稿
          </Button>
          <Button
            className="w-full justify-center"
            type="button"
            variant="outline"
            onClick={() => toast.message("预览使用下方相同的 Markdown 源。")}
          >
            分享预览
          </Button>
        </div>
      </aside>

      <div className="space-y-5">
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">编辑器</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>
          <TabsContent value="editor">
            <MarkdownEditor value={markdown} onChange={setMarkdown} />
          </TabsContent>
          <TabsContent value="preview">
            <div className="rounded-[1.8rem] border border-white/8 bg-white/3 p-6">
              <div className="prose-chen">
                <MarkdownViewer value={markdown} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
