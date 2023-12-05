'use client';

import React from 'react';

import { BytemdEditor } from '@/components/bytemd';

type Props = {
  name: string;
  defaultValue?: string;
};

export function BytemdEditorField({ name, defaultValue }: Props) {
  const [content, setContent] = React.useState(defaultValue ?? '');
  return (
    <div id="aifuxi-content-editor" className="w-full flex flex-col gap-1">
      <BytemdEditor
        content={content}
        setContent={(v) => {
          setContent(v);
        }}
      />
      <input type="hidden" name={name} value={content} />
    </div>
  );
}
