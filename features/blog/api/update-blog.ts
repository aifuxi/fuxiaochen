import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateQueries } from '@/lib/react-query';

import { toggleBlogPublished, updateBlog } from '../actions';
import { type UpdateBlogDTO } from '../types';

export const useUpdateBlog = () => {
  return useMutation({
    mutationKey: ['update_blog'],
    mutationFn: (params: UpdateBlogDTO) => updateBlog(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateQueries();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};

export const useToggleBlogPublish = () => {
  return useMutation({
    mutationKey: ['toggle_blog_publish'],
    mutationFn: (id: string) => toggleBlogPublished(id),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateQueries();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
