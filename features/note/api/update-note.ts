import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetNotesQuery } from './get-notes';

import { updateNote } from '../actions';
import { type UpdateNoteDTO } from '../types';

export const useUpdateNote = () => {
  return useMutation({
    mutationKey: ['update_note'],
    mutationFn: (params: UpdateNoteDTO) => updateNote(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetNotesQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
