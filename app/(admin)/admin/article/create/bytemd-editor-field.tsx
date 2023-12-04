'use client';

import React from 'react';

import { Flex } from '@radix-ui/themes';

import { BytemdEditor } from '@/components/client/bytemd';

type Props = {
  name: string;
  defaultValue?: string;
};

export function BytemdEditorField({ name, defaultValue }: Props) {
  const [content, setContent] = React.useState(defaultValue ?? '');
  return (
    <Flex
      gap={'1'}
      direction={'column'}
      id="aifuxi-content-editor"
      width={'100%'}
    >
      <BytemdEditor
        content={content}
        setContent={(v) => {
          setContent(v);
        }}
      />
      <input type="hidden" name={name} value={content} />
    </Flex>
  );
}
