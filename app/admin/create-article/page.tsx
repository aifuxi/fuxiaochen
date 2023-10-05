'use client';

import React, { useEffect, useState } from 'react';

import { useBoolean } from 'ahooks';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import { adminCreateTagAction } from '@/app/_actions/tag';
import { BytemdEditor } from '@/components/client';
import { PageLoading } from '@/components/rsc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_PAGE, MAX_PAGE_SIZE, ZERO } from '@/constants';
import {
  createArticle,
  getArticle,
  getTags,
  TAG_URL,
  updateArticle,
  uploadFile,
} from '@/services';
import type { CreateArticleRequest } from '@/types';

import TagCheckboxItem from './tag-checkbox-item';

import CreateTagButton from '../tag/create-tag-button';

const defaultCreateArticleReq: CreateArticleRequest = {
  title: '',
  description: '',
  friendlyUrl: '',
  content: '',
  cover: '',
  tags: [],
  published: true,
};

const AdminCreateArticle = () => {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR(TAG_URL, () =>
    getTags({ page: DEFAULT_PAGE, pageSize: MAX_PAGE_SIZE }),
  );
  const router = useRouter();
  const id = useSearchParams().get('id');
  const tags = data?.data;
  const [createArticleReq, setCreateArticleReq] =
    useState<CreateArticleRequest>(defaultCreateArticleReq);
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] =
    useBoolean(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      showLoading();
      getArticle(id)
        .then((res) => {
          const article = res.data;
          if (article) {
            const tagIds = article.tags?.map((v) => v.id) || [];
            setCreateArticleReq({
              title: article.title,
              friendlyUrl: article.friendlyUrl,
              description: article.description,
              content: article.content,
              cover: article.cover || '',
              tags: tagIds,
              published: article.published,
            });
          }
        })
        .finally(() => {
          hideLoading();
        });
    }
  }, [router, id, showLoading, hideLoading]);

  if (isLoading || loading) {
    return <PageLoading />;
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="fixed z-10 bottom-10 left-24 right-24 md:left-[20vw] md:right-[20vw] grid">
          {renderOperationButton()}
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="请输入标题..."
              value={createArticleReq.title}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setCreateArticleReq({ ...createArticleReq, title: value });
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="friendlyUrl">friendly_url</Label>
            <Input
              id="friendlyUrl"
              placeholder="请输入文章friendly_url（只支持数字、字母、下划线、中划线）..."
              value={createArticleReq.friendlyUrl}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setCreateArticleReq({
                  ...createArticleReq,
                  friendlyUrl: value,
                });
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="请输入描述..."
              value={createArticleReq.description}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setCreateArticleReq({
                  ...createArticleReq,
                  description: value,
                });
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cover">封面</Label>
            <input
              type="file"
              onChange={(e) => {
                const value = e.currentTarget.files?.[0];
                if (value) {
                  const fd = new FormData();
                  fd.append('file', value);

                  uploadFile(fd).then((res) => {
                    if (res.code === ZERO) {
                      setCreateArticleReq({
                        ...createArticleReq,
                        cover: res?.data?.url,
                      });
                      return;
                    }

                    toast({
                      variant: 'destructive',
                      title: res.msg || 'Error',
                      description: res.error || 'error',
                    });
                  });
                }
              }}
            />
            <Textarea
              id="cover"
              placeholder="请输入封面链接..."
              value={createArticleReq.cover}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setCreateArticleReq({ ...createArticleReq, cover: value });
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="published">是否发布</Label>
            <Switch
              id="published"
              checked={createArticleReq.published}
              onCheckedChange={(value) => {
                setCreateArticleReq({ ...createArticleReq, published: value });
              }}
            />
          </div>
          <div className="flex items-center flex-wrap gap-4">
            <Label>标签</Label>

            {tags?.map((tag) => {
              return (
                <TagCheckboxItem
                  key={tag.id}
                  tag={tag}
                  createArticleReq={createArticleReq}
                  setCreateArticleReq={setCreateArticleReq}
                />
              );
            })}
            <CreateTagButton
              createTag={adminCreateTagAction}
              refreshTag={mutate}
              triggerNode={
                <Button variant={'link'}>没找到合适的标签？点我新建一个</Button>
              }
            />
          </div>
          <div className="grid gap-2" id="aifuxi-content-editor">
            <Label htmlFor="content">内容</Label>
            <BytemdEditor
              content={createArticleReq.content}
              setContent={(content: string) => {
                setCreateArticleReq({ ...createArticleReq, content });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );

  function renderOperationButton() {
    if (id && typeof id === 'string') {
      return (
        <Button
          size={'lg'}
          onClick={() => {
            updateArticle(id, createArticleReq).then((res) => {
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
                  description: '编辑文章成功',
                });
                router.push('/admin/article');
              }
            });
          }}
        >
          <span>保存</span>
        </Button>
      );
    } else {
      return (
        <Button
          size={'lg'}
          onClick={() => {
            createArticle(createArticleReq).then((res) => {
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
                  description: '创建文章成功',
                });
                router.push('/admin/article');
              }
            });
          }}
        >
          <span>创建</span>
        </Button>
      );
    }
  }
};

export default AdminCreateArticle;
