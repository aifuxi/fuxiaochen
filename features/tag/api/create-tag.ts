import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetTagsQuery } from './get-tags';

import { createTag } from '../actions';
import { type CreateTagDTO } from '../types';

export const useCreateTag = () => {
  return useMutation({
    mutationKey: ['create_tag'],
    mutationFn: (params: CreateTagDTO) => createTag(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetTagsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
