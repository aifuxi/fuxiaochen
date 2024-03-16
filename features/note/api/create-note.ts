import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetNotesQuery } from './get-notes';

import { createNote } from '../actions';
import { type CreateNoteDTO } from '../types';

export const useCreateNote = () => {
  return useMutation({
    mutationKey: ['create_note'],
    mutationFn: (params: CreateNoteDTO) => createNote(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetNotesQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
