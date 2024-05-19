'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { TagTypeEnum } from '@prisma/client';
import { LoaderCircle, Plus } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { TAG_TYPES, TAG_TYPE_MAP } from '@/constants';
import {
  type CreateTagDTO,
  createTagSchema,
  useCreateTag,
} from '@/features/tag';
import { cn, toSlug } from '@/lib/utils';
import { convertSvgToDataUrl } from '@/utils';

type CreateTagButtonProps = {
  refreshAsync: () => Promise<unknown>;
};
export const CreateTagButton = ({ refreshAsync }: CreateTagButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<CreateTagDTO>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: TagTypeEnum.ALL,
    },
  });

  const createTagQuery = useCreateTag();

  React.useEffect(() => {
    if (open) {
      form.reset();
      form.clearErrors();
    }
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 w-4 h-4 " />
          创建标签
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建标签</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入名称" {...field} />
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
                        <Input placeholder="请输入slug" {...field} />
                        <Button type="button" onClick={handleFormatSlug}>
                          格式化
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={cn({
                            'text-muted-foreground': !field.value,
                          })}
                        >
                          <SelectValue placeholder="请选择标签" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAG_TYPES.map((el) => (
                          <SelectItem key={el} value={el}>
                            {TAG_TYPE_MAP[el]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>浅色图标</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入一个svg字符串（会自动转换为data url）或者data
                        url或者一个图片地址"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <Button
                      type="button"
                      onClick={() => handleFormatIcon('icon')}
                    >
                      转为Data Url
                    </Button>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconDark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>深色图标</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入一个svg字符串（会自动转换为data url）或者data
                        url或者一个图片地址"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <Button
                      type="button"
                      onClick={() => handleFormatIcon('iconDark')}
                    >
                      转为Data Url
                    </Button>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={createTagQuery.loading}
                  onClick={() => form.handleSubmit(handleSubmit)()}
                >
                  {createTagQuery.loading && (
                    <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                  )}
                  创建
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: CreateTagDTO) {
    if (values.icon) {
      values.icon = convertSvgToDataUrl(values.icon);
    }
    if (values.iconDark) {
      values.iconDark = convertSvgToDataUrl(values.iconDark);
    }

    await createTagQuery.runAsync(values);
    setOpen(false);
    await refreshAsync();
  }

  function handleFormatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue('slug', formatted);
    }
  }

  function handleFormatIcon(type: 'icon' | 'iconDark') {
    if (type === 'icon') {
      const tmp = form.getValues().icon?.trim();
      if (tmp) {
        const formatted = convertSvgToDataUrl(tmp);
        form.setValue('icon', formatted);
      }
    } else if (type === 'iconDark') {
      const tmp = form.getValues().iconDark?.trim();
      if (tmp) {
        const formatted = convertSvgToDataUrl(tmp);
        form.setValue('iconDark', formatted);
      }
    }
  }
};
