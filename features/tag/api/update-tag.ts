import { useMutation } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';

import { invalidateGetTagsQuery } from './get-tags';

import { updateTag } from '../actions';
import { type UpdateTagDTO } from '../types';

export const useUpdateTag = () => {
  return useMutation({
    mutationKey: ['update_tag'],
    mutationFn: (params: UpdateTagDTO) => updateTag(params),
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
