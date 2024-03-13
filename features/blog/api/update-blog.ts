import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetBlogsQuery } from './get-blogs';

import { toggleBlogPublished, updateBlog } from '../actions';
import { type UpdateBlogDTO } from '../types';

export const useUpdateBlog = () => {
  return useMutation({
    mutationKey: ['update_blog'],
    mutationFn: (params: UpdateBlogDTO) => updateBlog(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetBlogsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};

export const useToggleBlogPublish = () => {
  return useMutation({
    mutationKey: ['toggle_blog_publish'],
    mutationFn: (id: string) => toggleBlogPublished(id),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetBlogsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
