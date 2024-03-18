import { useRequest } from 'ahooks';

import { getTagByID } from '../actions';

export const useGetTag = (id: string, ready: boolean) => {
  return useRequest(() => getTagByID(id), {
    manual: true,
    ready: ready,
    loadingDelay: 300,
  });
};
