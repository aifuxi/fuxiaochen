'use client';

import React, { useState } from 'react';

import { Label } from '@radix-ui/react-label';
import { useBoolean } from 'ahooks';
import { Edit } from 'lucide-react';

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
import { useToast } from '@/components/ui/use-toast';
import { ZERO } from '@/constants';
import { updateTag } from '@/services';
import type { CreateTagRequest, Tag } from '@/types';

type Props = {
  tag: Tag;
  refreshTag: () => void;
};

const EditTagButton = ({ refreshTag, tag }: Props) => {
  const { toast } = useToast();
  const [state, { setTrue, setFalse }] = useBoolean(false);

  const [updateTagReq, setUpdateTagReq] = useState<CreateTagRequest>({
    name: tag.name,
    friendlyUrl: tag.friendlyUrl,
  });

  return (
    <Dialog
      open={state}
      onOpenChange={(visible) => {
        visible ? setTrue() : setFalse();
      }}
    >
      <DialogTrigger asChild>
        <Button size={'icon'} variant={'outline'}>
          <Edit size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑标签</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <Label>标签名称</Label>
            <Input
              value={updateTagReq.name}
              placeholder="请输入标签名称..."
              onChange={(e) => {
                const value = e.currentTarget.value;
                setUpdateTagReq({ ...updateTagReq, name: value });
              }}
            />
          </div>
          <div className="grid gap-4">
            <Label>friendly_url</Label>
            <Input
              value={updateTagReq.friendlyUrl || ''}
              placeholder="请输入标签friendly_url（只支持数字、字母、下划线、中划线）..."
              onChange={(e) => {
                const value = e.currentTarget.value;
                setUpdateTagReq({ ...updateTagReq, friendlyUrl: value });
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            size={'lg'}
            onClick={() => {
              updateTag(tag.id, updateTagReq)
                .then((res) => {
                  if (res.code !== ZERO) {
                    toast({
                      variant: 'destructive',
                      title: res.msg || 'Error',
                      description: res.error || 'error',
                    });
                  } else {
                    toast({
                      variant: 'default',
                      title: 'Success',
                      description: '编辑标签成功',
                    });
                  }
                })
                .finally(() => {
                  setFalse();
                  refreshTag?.();
                });
            }}
          >
            <span>保存</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTagButton;
