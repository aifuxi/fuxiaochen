"use client";

import { Editor, type EditorProps } from "@bytemd/react";
import zh_Hans from "bytemd/locales/zh_Hans.json";

import { plugins } from "./config";

type BytemdEditorProps = {
  body?: string;
  setBody: (body: string) => void;
  editorProps?: Partial<EditorProps>;
};

export const BytemdEditor = ({
  body,
  setBody,
  editorProps,
}: BytemdEditorProps) => {
  return (
    <Editor
      value={body ?? ""}
      plugins={plugins}
      placeholder="请输入内容..."
      onChange={(v) => setBody(v)}
      locale={zh_Hans}
      editorConfig={{
        ...editorProps,
      }}
    />
  );
};
