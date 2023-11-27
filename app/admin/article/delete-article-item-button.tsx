'use client';

import React from 'react';

import { IconButton } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteArticle } from '@/services';
import { type Article } from '@/types';

type Props = {
  article: Article;
  refreshArticle?: () => void;
};

export const DeleteArticleItemButton: React.FC<Props> = ({
  article,
  refreshArticle,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <IconButton className="bg-red-9" color="red">
          <Trash2 size={16} />
        </IconButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要删除该文章吗？</AlertDialogTitle>
          <AlertDialogDescription className="text-destructive">
            该操作不可逆，数据将直接从数据库删除
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteArticle(article.id).finally(() => {
                refreshArticle?.();
              });
            }}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
