'use client';

import { type Tag } from '@prisma/client';
import { Pencil1Icon } from '@radix-ui/react-icons';
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Text,
  TextField,
} from '@radix-ui/themes';

import { updateTag } from '@/app/_actions/tag';

type Props = {
  tag: Tag;
};

export function EditTagButton({ tag }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton color="gray" variant="solid" highContrast>
          <Pencil1Icon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>编辑标签</Dialog.Title>
        <form action={updateTag}>
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                名称
              </Text>
              <TextField.Input
                defaultValue={tag.name}
                placeholder="请输入标签名称"
                name="name"
                autoComplete="off"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                链接
              </Text>
              <TextField.Input
                defaultValue={tag.friendlyUrl}
                placeholder="请输入标签链接"
                name="friendlyUrl"
                autoComplete="off"
              />
            </label>
            <input type="hidden" name="id" value={tag.id} />
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                取消
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button type="submit" color="gray" highContrast>
                保存
              </Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default EditTagButton;
