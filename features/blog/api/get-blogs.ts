import { useRequest } from 'ahooks';

import { getBlogs } from '../actions';
import { type GetBlogsDTO } from '../types';

export const useGetBlogs = (params: GetBlogsDTO) => {
  return useRequest(() => getBlogs(params), {
    refreshDeps: [params],
    loadingDelay: 300,
  });
};
