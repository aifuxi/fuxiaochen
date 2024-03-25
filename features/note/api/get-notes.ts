import { useRequest } from 'ahooks';

import { getNotes } from '../actions';
import { type GetNotesDTO } from '../types';

export const useGetNotes = (params: GetNotesDTO) => {
  return useRequest(() => getNotes(params), {
    refreshDeps: [params],
    loadingDelay: 300,
  });
};
