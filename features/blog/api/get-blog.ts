import { useQuery } from '@tanstack/react-query';

import { getBlogByID } from '../actions';

export const useGetBlog = (id: string) => {
  return useQuery({
    queryKey: ['get_blog', id],
    queryFn: () => getBlogByID(id),
  });
};
