import { useRequest } from 'ahooks';

import { getUV, recordUV } from '../actions';

export const useRecordUV = () => {
  return useRequest((cid: string) => recordUV(cid), { manual: true });
};

export const useGetUV = () => {
  return useRequest(() => getUV());
};
