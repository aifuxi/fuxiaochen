import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetNotesQuery } from './get-notes';

import { deleteNoteByID } from '../actions';

export const useDeleteNote = () => {
  return useMutation({
    mutationKey: ['delete_note'],
    mutationFn: (id: string) => deleteNoteByID(id),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetNotesQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
