'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useParams, useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash-es';

import { PATHS } from '@/config';

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

import { BytemdEditor } from '@/components/bytemd';

import { CreateTagButton } from '@/features/admin';
import {
  type UpdateArticleDTO,
  updateArticleSchema,
  useGetArticle,
  useUpdateArticle,
} from '@/features/article';
import { useGetTags } from '@/features/tag';
import { uploadFile } from '@/features/upload';
import { toSlug } from '@/lib/utils';

export const EditArticleForm = () => {
  const getTagsQuery = useGetTags();
  const tags = React.useMemo(() => {
    return getTagsQuery.data?.tags ?? [];
  }, [getTagsQuery]);

  const { id } = useParams<{ id: string }>();
  const getArticleQuery = useGetArticle(id);
  const article = React.useMemo(() => {
    return getArticleQuery.data?.article;
  }, [getArticleQuery]);

  const updateArticleQuery = useUpdateArticle();

  const router = useRouter();
  const [cover, setCover] = React.useState(article?.cover);
  const form = useForm<UpdateArticleDTO>({
    resolver: zodResolver(updateArticleSchema),
    defaultValues: {
      title: article?.title ?? '',
      id: article?.id ?? '',
      slug: article?.slug ?? '',
      description: article?.description ?? '',
      body: article?.body ?? '',
      published: article?.published ?? true,
      cover: article?.cover ?? '',
      tags: article?.tags?.map((el) => el.id) ?? [],
    },
  });

  React.useEffect(() => {
    form.setValue('title', article?.title ?? '');
    form.setValue('id', article?.id ?? '');
    form.setValue('slug', article?.slug ?? '');
    form.setValue('description', article?.description ?? '');
    form.setValue('body', article?.body ?? '');
    form.setValue('published', article?.published ?? true);
    form.setValue('cover', article?.cover ?? '');
    form.setValue('tags', article?.tags?.map((el) => el.id) ?? []);
  }, [article, form]);

  return (
    <Form {...form}>
      <form autoComplete="off">
        <div className="fixed z-10 bottom-10 left-24 right-24 md:left-[20vw] md:right-[20vw]">
          <Button
            type="button"
            onClick={() => form.handleSubmit(handleSubmit)()}
            variant={'outline'}
            className="!w-full"
          >
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>slug</FormLabel>
                <FormControl>
                  <div className="flex items-center w-full gap-4">
                    <Input
                      {...field}
                      placeholder="请输入文章slug（只支持数字、字母、下划线、中划线）..."
                    />
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
                        toast('请选择一个文件');
                      }
                    } catch (error) {
                      toast.error(error as string);
                    }
                  }}
                />
                {!isNil(cover) && (
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
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-10">
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
                    </div>

                    <CreateTagButton />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <BytemdEditor
                    body={field.value}
                    setContent={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  async function handleSubmit(values: UpdateArticleDTO) {
    await updateArticleQuery.mutateAsync(values);
    router.push(PATHS.ADMIN_ARTICLE);
  }

  function handleFormatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue('slug', formatted);
    }
  }
};
