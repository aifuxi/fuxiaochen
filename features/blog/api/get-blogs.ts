import { useQuery } from '@tanstack/react-query';

import { getBlogs } from '../actions';
import { type GetBlogsDTO } from '../types';

export const useGetBlogs = (params: GetBlogsDTO) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => getBlogs(params),
  });
};
