'use server';

import { REDIS_PAGE_VIEW, REDIS_UNIQUE_VISITOR } from '@/constants';
import { redis } from '@/lib/redis';

export const recordPV = async () => {
  const pv = await redis.get(REDIS_PAGE_VIEW);

  if (pv) {
    await redis.incr(REDIS_PAGE_VIEW);
  } else {
    await redis.set(REDIS_PAGE_VIEW, 1);
  }
};

export const getPV = async () => {
  const pv = await redis.get(REDIS_PAGE_VIEW);
  return pv;
};

export const recordUV = async (cid: string) => {
  await redis.sadd(REDIS_UNIQUE_VISITOR, cid);
};

export const getUV = async () => {
  const uv = await redis.scard(REDIS_UNIQUE_VISITOR);
  return uv;
};
