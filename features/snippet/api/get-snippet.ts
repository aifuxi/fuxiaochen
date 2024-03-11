import { useQuery } from '@tanstack/react-query';

import { getSnippetByID } from '../actions';

export const useGetSnippet = (id: string) => {
  return useQuery({
    queryKey: ['get_aritcle', id],
    queryFn: () => getSnippetByID(id),
  });
};
