import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetTagsQuery } from './get-tags';

import { updateTag } from '../actions';
import { type UpdateTagDTO } from '../types';

export const useUpdateTag = () => {
  return useMutation({
    mutationKey: ['update_tag'],
    mutationFn: (params: UpdateTagDTO) => updateTag(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetTagsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
