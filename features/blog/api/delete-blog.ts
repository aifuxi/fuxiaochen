import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetBlogsQuery } from './get-blogs';

import { deleteBlogByID } from '../actions';

export const useDeleteBlog = () => {
  return useMutation({
    mutationKey: ['delete_blog'],
    mutationFn: (id: string) => deleteBlogByID(id),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetBlogsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
