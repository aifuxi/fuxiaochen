import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetBlogsQuery } from './get-blogs';

import { deleteBlogByID } from '../actions';

export const useDeleteBlog = () => {
  return useMutation({
    mutationKey: ['delete_blog'],
    mutationFn: (id: string) => deleteBlogByID(id),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetBlogsQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
