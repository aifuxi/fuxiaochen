'use client';

import { Editor, type EditorProps } from '@bytemd/react';
import zh_Hans from 'bytemd/locales/zh_Hans.json';

import { ZERO } from '@/constants/index';
import { uploadFile } from '@/services';

import { plugins } from './config';

import { useToast } from '../ui/use-toast';

type Props = {
  content: string;
  setContent: (content: string) => void;
  editorProps?: Partial<EditorProps>;
};

const BytemdEditor: React.FC<Props> = ({
  content,
  setContent,
  editorProps,
}) => {
  const { toast } = useToast();
  const handleUploadImages: EditorProps['uploadImages'] = async (files) => {
    const fd = new FormData();
    fd.append('file', files[0]);
    const res = await uploadFile(fd);

    if (res.code !== ZERO) {
      toast({
        variant: 'destructive',
        title: res.msg || 'Error',
        description: res.error || 'error',
      });
      return [];
    }
    return [
      {
        url: res.data?.url || '',
      },
    ];
  };

  return (
    <Editor
      value={content}
      plugins={plugins}
      placeholder="请输入内容..."
      onChange={(v) => setContent(v)}
      uploadImages={handleUploadImages}
      locale={zh_Hans}
      {...editorProps}
    />
  );
};

export default BytemdEditor;
