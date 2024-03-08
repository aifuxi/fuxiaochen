import { useMutation } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';

import { invalidateGetTagsQuery } from './get-tags';

import { createTag } from '../actions';
import { type CreateTagDTO } from '../types';

export const useCreateTag = () => {
  return useMutation({
    mutationKey: ['create_tag'],
    mutationFn: (params: CreateTagDTO) => createTag(params),
    async onSuccess() {
      toast({
        title: '操作成功',
      });
      await invalidateGetTagsQuery();
    },
    onError(error) {
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error.message,
      });
    },
  });
};
