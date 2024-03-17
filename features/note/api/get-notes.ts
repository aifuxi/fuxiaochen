import { useQuery } from '@tanstack/react-query';

import { getNotes } from '../actions';
import { type GetNotesDTO } from '../types';

export const useGetNotes = (params: GetNotesDTO) => {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => getNotes(params),
  });
};
