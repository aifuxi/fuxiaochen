'use client';

import { Editor, type EditorProps } from '@bytemd/react';
import zh_Hans from 'bytemd/locales/zh_Hans.json';

import { uploadFile } from '@/app/actions/upload';

import { plugins, sanitize } from './config';

import { useToast } from '../ui/use-toast';

type Props = {
  content?: string;
  setContent: (content: string) => void;
  editorProps?: Partial<EditorProps>;
};

export function BytemdEditor({ content, setContent, editorProps }: Props) {
  const { toast } = useToast();

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
        toast({
          title: '请求失败',
          variant: 'destructive',
          description: error as string,
        });
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
        lineNumbers: true,
      }}
    />
  );
}
