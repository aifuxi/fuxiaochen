import { useRequest } from 'ahooks';

import { getPV, recordPV } from '../actions';

export const useRecordPV = () => {
  return useRequest(recordPV, { manual: true });
};

export const useGetPV = () => {
  return useRequest(() => getPV());
};
