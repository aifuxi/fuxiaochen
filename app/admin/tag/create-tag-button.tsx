'use client';

import React from 'react';

import { type Tag } from '@prisma/client';
import { Label } from '@radix-ui/react-label';
import { useBoolean } from 'ahooks';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { CreateTagRequest } from '@/types';

const defaultCreateTagReq: CreateTagRequest = {
  name: '',
  friendlyUrl: '',
};

type Props = {
  triggerNode: React.ReactNode;
  createTag: (req: CreateTagRequest) => Promise<Tag>;
  refreshTag?: () => Promise<any>;
};

const CreateTagButton = ({ triggerNode, createTag, refreshTag }: Props) => {
  const [state, { setTrue, setFalse }] = useBoolean(false);

  const [createTagReq, setCreateTagReq] =
    React.useState<CreateTagRequest>(defaultCreateTagReq);

  return (
    <Dialog
      open={state}
      onOpenChange={(visible) => {
        visible ? setTrue() : setFalse();
      }}
    >
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建标签</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <Label>标签名称</Label>
            <Input
              value={createTagReq.name}
              placeholder="请输入标签名称..."
              onChange={(e) => {
                const value = e.currentTarget.value;
                setCreateTagReq({ ...createTagReq, name: value });
              }}
            />
          </div>
          <div className="grid gap-4">
            <Label>friendly_url</Label>
            <Input
              value={createTagReq.friendlyUrl ?? ''}
              placeholder="请输入标签friendly_url（只支持数字、字母、下划线、中划线）..."
              onChange={(e) => {
                const value = e.currentTarget.value;
                setCreateTagReq({ ...createTagReq, friendlyUrl: value });
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            size={'lg'}
            onClick={async () => {
              try {
                await createTag(createTagReq);
              } catch (error) {
              } finally {
                setFalse();
                setCreateTagReq(defaultCreateTagReq);
                await refreshTag?.();
              }
            }}
          >
            <span>创建</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTagButton;
