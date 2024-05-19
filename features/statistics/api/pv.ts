import { useRequest } from 'ahooks';

import { recordPV } from '../actions';

export const useRecordPV = () => {
  return useRequest(recordPV, { manual: true });
};
