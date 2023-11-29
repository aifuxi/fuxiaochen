import {
  Button,
  Flex,
  Switch,
  Text,
  TextArea,
  TextFieldInput,
} from '@radix-ui/themes';

import { BytemdEditorField } from './bytemd-editor-field';
import { TagsField } from './tags-field';
import { createArticle } from '@/app/_actions/article';
import { getAllTags } from '@/app/_actions/tag';

export default async function AdminArticleCreate() {
  const tags = await getAllTags();

  return (
    <form action={createArticle}>
      <Flex direction={'column'} gap={'4'}>
        <div className="fixed z-10 bottom-10 left-24 right-24 md:left-[20vw] md:right-[20vw]">
          <Button type="submit" className="!w-full" size={'4'}>
            创建
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
          <Flex direction={'column'} gap={'1'}>
            <Text as="div" size="2" weight="bold">
              封面
            </Text>
            <TextFieldInput
              placeholder="请输入封面链接..."
              name="cover"
              autoComplete="off"
            />
            <input type="file" />
          </Flex>
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
        </Flex>
      </Flex>
    </form>
  );
}
