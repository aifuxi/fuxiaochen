import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateQueries } from '@/lib/react-query';

import { toggleNotePublished, updateNote } from '../actions';
import { type UpdateNoteDTO } from '../types';

export const useUpdateNote = () => {
  return useMutation({
    mutationKey: ['update_note'],
    mutationFn: (params: UpdateNoteDTO) => updateNote(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateQueries();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};

export const useToggleNotePublish = () => {
  return useMutation({
    mutationKey: ['toggle_note_publish'],
    mutationFn: (id: string) => toggleNotePublished(id),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateQueries();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
