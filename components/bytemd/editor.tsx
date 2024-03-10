'use client';

import toast from 'react-hot-toast';

import { Editor, type EditorProps } from '@bytemd/react';
import zh_Hans from 'bytemd/locales/zh_Hans.json';

import { uploadFile } from '@/features/upload';

import { plugins, sanitize } from './config';

type BytemdEditorProps = {
  content?: string;
  setContent: (content: string) => void;
  editorProps?: Partial<EditorProps>;
};

export const BytemdEditor = ({
  content,
  setContent,
  editorProps,
}: BytemdEditorProps) => {
  const handleUploadImages: EditorProps['uploadImages'] = async (files) => {
    const file = files[0];
    if (file) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const url = await uploadFile(fd);
        return [
          {
            url,
          },
        ];
      } catch (error) {
        toast.error(error as string);
        return [];
      }
    } else {
      return [];
    }
  };

  return (
    <Editor
      value={content ?? ''}
      plugins={plugins}
      placeholder="请输入内容..."
      sanitize={sanitize}
      onChange={(v) => setContent(v)}
      uploadImages={handleUploadImages}
      locale={zh_Hans}
      editorConfig={{
        ...editorProps,
      }}
    />
  );
};
