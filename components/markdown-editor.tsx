"use client";

import { useCallback } from "react";

import { Editor } from "@bytemd/react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api/fetcher";
import { uploadImageToOss } from "@/lib/api/uploads";
import {
  markdownEditorPlugins,
  sanitizeMarkdownSchema,
} from "@/lib/markdown/bytemd-plugins";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function MarkdownEditor({
  className,
  onChange,
  placeholder,
  value,
}: MarkdownEditorProps) {
  const handleUploadImages = useCallback(async (files: File[]) => {
    const toastId = toast.loading("图片上传中...");

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const result = await uploadImageToOss(file, "general-image");

          return {
            alt: file.name,
            title: file.name,
            url: result.fileUrl,
          };
        }),
      );

      toast.success("图片已上传", { id: toastId });

      return results;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "图片上传失败"), { id: toastId });

      return [];
    }
  }, []);

  return (
    <div
      className={cn(
        "markdown-editor flex h-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <Editor
        value={value}
        plugins={markdownEditorPlugins}
        sanitize={sanitizeMarkdownSchema}
        placeholder={placeholder}
        onChange={onChange}
        uploadImages={handleUploadImages}
      />
    </div>
  );
}
