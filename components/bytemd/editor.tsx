"use client";

import { Editor, type EditorProps } from "@bytemd/react";
import zh_Hans from "bytemd/locales/zh_Hans.json";
import { fileTypeFromBlob } from "file-type";

import { request } from "@/lib/request";

import { getUploadInfo } from "./api";
import { plugins } from "./config";

import { hideToast, showErrorToast, showLoadingToast } from "../toast";

interface BytemdEditorProps {
  body?: string;
  setContent: (body: string) => void;
  editorProps?: Partial<EditorProps>;
}

export const BytemdEditor = ({
  body,
  setContent,
  editorProps,
}: BytemdEditorProps) => {
  return (
    <Editor
      value={body ?? ""}
      plugins={plugins}
      placeholder="请输入内容..."
      onChange={(v) => {
        setContent(v);
      }}
      locale={zh_Hans}
      editorConfig={{
        ...editorProps,
      }}
      uploadImages={async (files) => {
        try {
          showLoadingToast("图片上传中...");
          const promises = files.map(async (file) => {
            const fileType = await fileTypeFromBlob(file);
            const res = await getUploadInfo({
              filename: file.name,
              contentType: fileType?.mime ?? "application/octet-stream",
            });

            if (res.signatureUrl) {
              await request.put(res.signatureUrl, file, {
                headers: {
                  "Content-Type": res.contentType,
                },
              });
              const url = res.signatureUrl.split("?")[0];
              return [{ url: url ?? "" }];
            }
            return [];
          });
          const results = await Promise.all(promises);
          hideToast();
          return results.flat();
        } catch (error) {
          hideToast();
          showErrorToast("图片上传失败" + error);
          return [];
        }
      }}
    />
  );
};
