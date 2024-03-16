import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getNotes } from '../actions';
import { type GetNotesDTO } from '../types';

const queryKey = ['notes'];

export const useGetNotes = (params: GetNotesDTO) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => getNotes(params),
  });
};

export const invalidateGetNotesQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
