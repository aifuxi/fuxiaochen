import { useQuery } from '@tanstack/react-query';

import { getNoteByID } from '../actions';

export const useGetNote = (id: string) => {
  return useQuery({
    queryKey: ['get_note', id],
    queryFn: () => getNoteByID(id),
  });
};
