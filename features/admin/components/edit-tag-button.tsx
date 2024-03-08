'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Tag } from '@prisma/client';
import { PencilIcon } from 'lucide-react';

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

import { toSlug } from '@/utils/helper';

import { type UpdateTagDTO, updateTag, updateTagSchema } from '@/features/tag';

type EditTagButtonProps = {
  tag: Tag;
};

export const EditTagButton = ({ tag }: EditTagButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateTagDTO>({
    resolver: zodResolver(updateTagSchema),
  });

  React.useEffect(() => {
    if (open) {
      form.setValue('name', tag.name);
      form.setValue('slug', tag.slug);
      form.setValue('id', tag.id);
      form.clearErrors();
    }
  }, [form, open, tag]);

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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>slug</FormLabel>
                    <FormControl>
                      <div className="flex items-center w-full gap-4">
                        <Input placeholder="请输入标签slug" {...field} />
                        <Button type="button" onClick={formatSlug}>
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

  async function onSubmit(values: UpdateTagDTO) {
    const resp = await updateTag(values);
    setOpen(false);

    if (resp?.error) {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: resp?.error,
      });
      return;
    }

    toast({
      title: '操作成功',
      description: 'Success',
    });
  }

  function formatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue('slug', formatted);
    }
  }
};
