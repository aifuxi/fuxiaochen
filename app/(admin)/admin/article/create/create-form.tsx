'use client';

import React from 'react';

import { type Tag } from '@prisma/client';
import {
  Button,
  Switch,
  Text,
  TextArea,
  TextFieldInput,
} from '@radix-ui/themes';

import { BytemdEditorField } from './bytemd-editor-field';
import { TagsField } from './tags-field';
import { createArticle } from '@/app/_actions/article';
import { ZERO } from '@/constants/unknown';
import { uploadFile } from '@/services/upload';

export function CreateForm({ tags }: { tags?: Tag[] }) {
  const [cover, setCover] = React.useState('');

  return (
    <form action={createArticle}>
      <div className="flex flex-col gap-4">
        <div className="fixed z-10 bottom-10 left-24 right-24 md:left-[20vw] md:right-[20vw]">
          <Button type="submit" className="!w-full" size={'4'}>
            创建
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              标题
            </Text>
            <TextFieldInput
              placeholder="请输入标题..."
              name="title"
              autoComplete="off"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              friendly_url
            </Text>
            <TextFieldInput
              placeholder="请输入文章friendly_url（只支持数字、字母、下划线、中划线）..."
              name="friendlyUrl"
              autoComplete="off"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              描述
            </Text>
            <TextArea
              placeholder="请输入描述..."
              name="description"
              autoComplete="off"
            />
          </label>
          <div className="flex flex-col gap-1">
            <Text as="div" size="2" weight="bold">
              封面
            </Text>
            <TextFieldInput
              placeholder="请输入封面链接..."
              name="cover"
              key={cover}
              defaultValue={cover}
              autoComplete="off"
            />
            <input
              type="file"
              onChange={async (e) => {
                const fd = new FormData();
                fd.append('file', e.target.files?.[0]);
                const res = await uploadFile(fd);

                if (res.code === ZERO) {
                  setCover(res.data?.url ?? '');
                }
              }}
            />
            <img src={cover} className="h-[300px] object-scale-down" alt={''} />
          </div>
          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              是否发布
            </Text>
            <Switch name="published" color="gray" highContrast defaultChecked />
          </div>
          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              标签
            </Text>
            <TagsField tags={tags} name="tags" />
          </div>
          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              内容
            </Text>
            <BytemdEditorField name="content" />
          </div>
        </div>
      </div>
    </form>
  );
}
