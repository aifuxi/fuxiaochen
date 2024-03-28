import Redis, { type Redis as RedisInstanceType } from 'ioredis';

import { NODE_ENV, REDIS_HOST, REDIS_PORT } from '@/config';

import { REDIS_KYE_PREFIX } from '@/constants';

const globalForRedis = global as unknown as { redis: RedisInstanceType };

export const redis =
  globalForRedis.redis ||
  new Redis({
    host: REDIS_HOST || '127.0.0.1',
    port: Number(REDIS_PORT) || 6379,
    keyPrefix: REDIS_KYE_PREFIX,
  });

if (NODE_ENV !== 'production') globalForRedis.redis = redis;
