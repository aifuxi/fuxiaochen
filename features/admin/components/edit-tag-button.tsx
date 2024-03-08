'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Tag } from '@prisma/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2Icon, PencilIcon } from 'lucide-react';

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

import { LoadingSpinner } from '@/components/loading-spinner';

import { toSlug } from '@/utils/helper';

import {
  type UpdateTagDTO,
  getTagByID,
  updateTag,
  updateTagSchema,
} from '@/features/tag';
import { queryClient } from '@/lib/react-query';

type EditTagButtonProps = {
  tag: Tag;
};

export const EditTagButton = ({ tag }: EditTagButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateTagDTO>({
    resolver: zodResolver(updateTagSchema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tag', tag.id],
    queryFn: () => getTagByID(tag.id),
    enabled: Boolean(tag.id && open),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['tag', tag.id],
    mutationFn: (params: UpdateTagDTO) => updateTag(params),
    async onSuccess(resp) {
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
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  React.useEffect(() => {
    if (open && data?.tag) {
      const { tag } = data;
      form.setValue('name', tag.name);
      form.setValue('slug', tag.slug);
      form.setValue('id', tag.id);
      form.clearErrors();
    }
  }, [data, form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'icon'} onClick={() => setOpen(true)}>
          <PencilIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <LoadingSpinner loading={isLoading} />
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
                  onClick={() => form.handleSubmit(handleSubmit)()}
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  保存
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: UpdateTagDTO) {
    await mutateAsync(values);
  }

  function formatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue('slug', formatted);
    }
  }
};
