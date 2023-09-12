'use client';

import React from 'react';

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
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ZERO } from '@/constants';
import { deleteArticle } from '@/services';
import { Article } from '@/types';

type Props = {
  article: Article;
  refreshArticle?: () => void;
};

export const DeleteArticleItemButton: React.FC<Props> = ({
  article,
  refreshArticle,
}) => {
  const { toast } = useToast();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'} size={'icon'}>
          <Trash2 size={16} />
        </Button>
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
              deleteArticle(article.id)
                .then((res) => {
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
                      description: '操作成功',
                    });
                  }
                })
                .finally(() => {
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
