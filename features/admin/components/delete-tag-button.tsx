'use client';

import * as React from 'react';

import { type Tag } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon, TrashIcon } from 'lucide-react';

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
import { useToast } from '@/components/ui/use-toast';

import { deleteTagByID } from '@/features/tag';
import { queryClient } from '@/lib/react-query';

type DeleteTagButtonProps = {
  tag: Tag;
};

export const DeleteTagButton = ({ tag }: DeleteTagButtonProps) => {
  const { toast } = useToast();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['tag', tag.id],
    mutationFn: (id: string) => deleteTagByID(id),
    async onSuccess(resp) {
      if (resp?.error) {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: resp?.error,
        });
        return;
      }

      toast({
        title: '操作成功',
        description: 'Success',
      });
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'icon'}>
          <TrashIcon size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除标签</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该标签吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteTag} disabled={isPending}>
            {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDeleteTag() {
    await mutateAsync(tag.id);
  }
};
