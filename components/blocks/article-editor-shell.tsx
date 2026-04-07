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
        <div className="type-label">Article Settings</div>
        <TextField label="Title" name="title" placeholder="Building a calm CMS" />
        <TextField label="Slug" name="slug" placeholder="building-a-calm-cms" />
        <TextareaField
          defaultValue="A concise editorial note on interface pacing and CMS ergonomics."
          description="Used in archive cards and social previews."
          label="Excerpt"
          name="excerpt"
          placeholder="Short summary"
        />
        <Select
          options={[
            { label: "Draft", value: "draft" },
            { label: "Review", value: "review" },
            { label: "Published", value: "published" },
          ]}
          value={status}
          onValueChange={(value) => setStatus(value as string)}
        />
        <div className="grid gap-3">
          <Button
            className="w-full justify-center"
            onClick={() =>
              startTransition(() => {
                toast.success("Mock draft saved", { description: `Status: ${status}` });
              })
            }
            type="button"
          >
            Save Draft
          </Button>
          <Button
            className="w-full justify-center"
            type="button"
            variant="outline"
            onClick={() => toast.message("Preview uses the same markdown source below.")}
          >
            Share Preview
          </Button>
        </div>
      </aside>

      <div className="space-y-5">
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
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
