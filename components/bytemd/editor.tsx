'use client';

import { Editor, type EditorProps } from '@bytemd/react';
import zh_Hans from 'bytemd/locales/zh_Hans.json';

import { uploadFile } from '@/features/upload';

import { plugins, sanitize } from './config';

import { showErrorToast } from '../ui/toast';

type BytemdEditorProps = {
  body?: string;
  setContent: (body: string) => void;
  editorProps?: Partial<EditorProps>;
};

export const BytemdEditor = ({
  body,
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
        showErrorToast(error as string);
        return [];
      }
    } else {
      return [];
    }
  };

  return (
    <Editor
      value={body ?? ''}
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
