import { getTagByID } from '..';
import { type QueryClientConfig, useQuery } from '@tanstack/react-query';

export const useGetTag = (id: string, config?: QueryClientConfig) => {
  return useQuery({
    ...config,
    queryKey: ['get_tag', id],
    queryFn: () => getTagByID(id),
  });
};
