'use client';

import { Editor, type EditorProps } from '@bytemd/react';
import zh_Hans from 'bytemd/locales/zh_Hans.json';

import { plugins } from './config';
import { ZERO } from '@/constants/unknown';
import { uploadFile } from '@/services/upload';

type Props = {
  content?: string;
  setContent: (content: string) => void;
  editorProps?: Partial<EditorProps>;
};

export function BytemdEditor({ content, setContent, editorProps }: Props) {
  const handleUploadImages: EditorProps['uploadImages'] = async (files) => {
    const file = files[0];
    if (file) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFile(fd);

      if (res.code !== ZERO) {
        return [];
      }
      return [
        {
          url: res.data?.url ?? '',
        },
      ];
    } else {
      return [];
    }
  };

  return (
    <Editor
      value={content ?? ''}
      plugins={plugins}
      placeholder="请输入内容..."
      onChange={(v) => setContent(v)}
      uploadImages={handleUploadImages}
      locale={zh_Hans}
      {...editorProps}
    />
  );
}
