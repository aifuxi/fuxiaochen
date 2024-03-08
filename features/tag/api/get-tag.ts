import { useQuery } from '@tanstack/react-query';

import { getTagByID } from '../actions';

export const useGetTag = (id: string) => {
  return useQuery({
    queryKey: ['get_tag', id],
    queryFn: () => getTagByID(id),
  });
};
