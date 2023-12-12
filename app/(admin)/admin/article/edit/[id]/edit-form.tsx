'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Article, type Tag } from '@prisma/client';
import { type z } from 'zod';

import { updateArticle } from '@/app/actions/article';
import { uploadFile } from '@/app/actions/upload';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

import { BytemdEditor } from '@/components/bytemd';

import {
  type UpdateArticleReq,
  updateArticleReqSchema,
} from '@/typings/article';

import { PLACEHOLDER_COVER } from '@/constants/unknown';

export function EditForm({
  article,
  tags,
}: {
  article?: Article & { tags?: Tag[] };
  tags?: Tag[];
}) {
  const [cover, setCover] = React.useState(article?.cover ?? PLACEHOLDER_COVER);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof updateArticleReqSchema>>({
    resolver: zodResolver(updateArticleReqSchema),
    defaultValues: {
      title: article?.title ?? '',
      id: article?.id ?? '',
      friendlyURL: article?.friendlyURL ?? '',
      description: article?.description ?? '',
      content: article?.content ?? '',
      published: article?.published ?? true,
      cover: article?.cover ?? PLACEHOLDER_COVER,
      tags: article?.tags?.map((el) => el.id) ?? [],
    },
  });

  async function onSubmit(values: UpdateArticleReq) {
    try {
      await updateArticle(values);
    } catch (e) {}
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <div className="fixed z-10 bottom-10 left-24 right-24 md:left-[20vw] md:right-[20vw]">
          <Button type="submit" variant={'outline'} className="!w-full">
            保存
          </Button>
        </div>

        <div className="grid gap-4 pb-24">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="请输入标题..." />
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
                <FormLabel>friendly_url</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="请输入文章friendly_url（只支持数字、字母、下划线、中划线）..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="请输入描述..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>封面</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="请输入封面链接..." />
                </FormControl>
                <FormMessage />
                <Input
                  type="file"
                  onChange={async (e) => {
                    try {
                      const file = e.target.files?.[0];
                      if (file) {
                        const fd = new FormData();
                        fd.append('file', file);
                        const url = await uploadFile(fd);

                        setCover(url ?? '');
                        form.setValue('cover', url ?? '');
                      } else {
                        toast({
                          title: '提示',
                          description: '请选择一个文件',
                        });
                      }
                    } catch (error) {
                      toast({
                        title: '请求失败',
                        variant: 'destructive',
                        description: error as string,
                      });
                    }
                  }}
                />
                {Boolean(cover) && (
                  <img
                    src={cover}
                    className="h-[300px] object-scale-down"
                    alt={''}
                  />
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem>
                <FormLabel>是否发布</FormLabel>
                <FormControl>
                  <div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标签</FormLabel>
                <FormControl>
                  <Combobox
                    options={
                      tags?.map((el) => ({
                        label: el.name,
                        value: el.id,
                      })) ?? []
                    }
                    multiple
                    clearable
                    selectPlaceholder="请选择文章标签（多选）"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <div id="aifuxi-content-editor">
                    <BytemdEditor
                      content={field.value}
                      setContent={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
