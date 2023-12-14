'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Tag } from '@prisma/client';
import { PencilIcon } from 'lucide-react';

import { updateTag } from '@/app/actions/tag';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

import { type UpdateTagReq, updateTagReqSchema } from '@/typings/tag';

import { toFriendlyURL } from '@/utils/helper';

type Props = {
  tag: Tag;
};

export function EditTagButton({ tag }: Props) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<UpdateTagReq>({
    resolver: zodResolver(updateTagReqSchema),
  });

  React.useEffect(() => {
    if (open) {
      form.setValue('name', tag.name);
      form.setValue('friendlyURL', tag.friendlyURL);
      form.setValue('id', tag.id);
      form.clearErrors();
    }
  }, [form, open, tag]);

  async function onSubmit(values: UpdateTagReq) {
    try {
      await updateTag(values);
      setOpen(false);
    } catch (e) {
      toast({
        title: '请求失败',
        variant: 'destructive',
        description: e as string,
      });
    }
  }

  function formatFriendlyURL() {
    const tmp = form.getValues().friendlyURL?.trim();
    if (tmp) {
      const formatted = toFriendlyURL(tmp);
      form.setValue('friendlyURL', formatted);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'icon'} onClick={() => setOpen(true)}>
          <PencilIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑标签</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>id</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input
                        className="flex-1"
                        placeholder="请输入标签名称"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="friendlyURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>链接</FormLabel>
                    <FormControl>
                      <div className="flex items-center w-full gap-4">
                        <Input placeholder="请输入标签链接" {...field} />
                        <Button type="button" onClick={formatFriendlyURL}>
                          格式化
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => form.handleSubmit(onSubmit)()}
                >
                  保存
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditTagButton;
