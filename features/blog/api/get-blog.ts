import { useRequest } from 'ahooks';

import { getBlogByID } from '../actions';

export const useGetBlog = (id: string, ready: boolean) => {
  return useRequest(() => getBlogByID(id), {
    ready,
    loadingDelay: 300,
  });
};
