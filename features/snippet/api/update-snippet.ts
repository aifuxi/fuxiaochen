import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateQueries } from '@/lib/react-query';

import { toggleSnippetPublished, updateSnippet } from '../actions';
import { type UpdateSnippetDTO } from '../types';

export const useUpdateSnippet = () => {
  return useMutation({
    mutationKey: ['update_snippet'],
    mutationFn: (params: UpdateSnippetDTO) => updateSnippet(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateQueries();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};

export const useToggleSnippetPublish = () => {
  return useMutation({
    mutationKey: ['toggle_snippet_publish'],
    mutationFn: (id: string) => toggleSnippetPublished(id),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateQueries();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
