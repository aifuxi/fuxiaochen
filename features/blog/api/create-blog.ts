import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetBlogsQuery } from './get-blogs';

import { createBlog } from '../actions';
import { type CreateBlogDTO } from '../types';

export const useCreateBlog = () => {
  return useMutation({
    mutationKey: ['create_blog'],
    mutationFn: (params: CreateBlogDTO) => createBlog(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetBlogsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
