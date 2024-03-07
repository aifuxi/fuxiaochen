'use client';

import * as React from 'react';

import { type Article } from '@prisma/client';
import { TrashIcon } from 'lucide-react';

import { deleteArticle } from '@/app/actions/article';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type Props = {
  article: Article;
};

export function DeleteArticleItemButton({ article }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'icon'}>
          <TrashIcon size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除文章</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该文章吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deleteArticle(article.id);
            }}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
