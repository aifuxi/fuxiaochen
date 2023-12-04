'use client';

import React from 'react';

import { type Article, type Tag } from '@prisma/client';
import {
  Button,
  Flex,
  Switch,
  Text,
  TextArea,
  TextFieldInput,
} from '@radix-ui/themes';

import { updateArticle } from '@/app/_actions/article';
import { ZERO } from '@/constants/unknown';
import { uploadFile } from '@/services/upload';

import { BytemdEditorField } from '../../create/bytemd-editor-field';
import { TagsField } from '../../create/tags-field';

export function EditForm({
  article,
  tags,
}: {
  article?: Article & { tags?: Tag[] };
  tags?: Tag[];
}) {
  const [cover, setCover] = React.useState(article?.cover ?? '');

  return (
    <form action={updateArticle}>
      <Flex direction={'column'} gap={'4'}>
        <div className="fixed z-10 bottom-10 left-24 right-24 md:left-[20vw] md:right-[20vw]">
          <Button type="submit" className="!w-full" size={'4'}>
            保存
          </Button>
        </div>
        <Flex direction={'column'} gap={'4'}>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              标题
            </Text>
            <TextFieldInput
              placeholder="请输入标题..."
              name="title"
              defaultValue={article?.title}
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
              defaultValue={article?.friendlyUrl}
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
              defaultValue={article?.description}
              autoComplete="off"
            />
          </label>
          <Flex direction={'column'} gap={'1'}>
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
            <img
              src={cover}
              className="h-[300px] object-scale-down"
              alt={article?.title}
            />
          </Flex>
          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              是否发布
            </Text>
            <Switch
              name="published"
              color="gray"
              highContrast
              defaultChecked={article?.published}
            />
          </div>
          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              标签
            </Text>
            <TagsField tags={tags} name="tags" initialTags={article?.tags} />
          </div>
          <div>
            <Text as="div" size="2" mb="1" weight="bold">
              内容
            </Text>
            <BytemdEditorField name="content" defaultValue={article?.content} />
          </div>

          <input type="hidden" name="id" value={article?.id} />
        </Flex>
      </Flex>
    </form>
  );
}
