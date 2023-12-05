'use client';

import React from 'react';

import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Text, TextField } from '@radix-ui/themes';

import { createTag } from '@/app/_actions/tag';

export function CreateTagButton() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button color="gray" variant="solid" highContrast>
          <PlusIcon />
          <span>创建标签</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>创建标签</Dialog.Title>
        <form action={createTag}>
          <div className="flex flex-col gap-3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                名称
              </Text>
              <TextField.Input
                defaultValue=""
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
                defaultValue=""
                placeholder="请输入标签链接"
                name="friendlyUrl"
                autoComplete="off"
              />
            </label>
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                取消
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button type="submit" color="gray" highContrast>
                创建
              </Button>
            </Dialog.Close>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
