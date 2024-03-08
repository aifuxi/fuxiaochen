import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetTagsQuery } from './get-tags';

import { deleteTagByID } from '../actions';

export const useDeleteTag = () => {
  return useMutation({
    mutationKey: ['delete_tag'],
    mutationFn: (id: string) => deleteTagByID(id),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetTagsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
