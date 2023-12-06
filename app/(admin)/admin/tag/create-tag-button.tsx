'use client';

import React from 'react';

import { Text, TextField } from '@radix-ui/themes';
import { PlusIcon } from 'lucide-react';

import { createTag } from '@/app/_actions/tag';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateTagButton() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          <PlusIcon className="mr-2" size={16} />
          创建标签
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建标签</DialogTitle>
        </DialogHeader>
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
          <DialogFooter>
            <Button>创建</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
