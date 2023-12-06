'use client';

import React from 'react';

import { type Article } from '@prisma/client';
import { AlertDialog, Button, IconButton } from '@radix-ui/themes';
import { TrashIcon } from 'lucide-react';

import { deleteArticle } from '@/app/_actions/article';

type Props = {
  article: Article;
};

export function DeleteArticleItemButton({ article }: Props) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <IconButton color="red">
          <TrashIcon />
        </IconButton>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>删除文章</AlertDialog.Title>
        <AlertDialog.Description>确定要删除该文章吗？</AlertDialog.Description>

        <div className="flex gap-3 mt-4 justify-end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              取消
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={async () => {
                await deleteArticle(article.id);
              }}
            >
              删除
            </Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
