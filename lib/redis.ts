import Redis, { type Redis as RedisInstanceType } from 'ioredis';

import { NODE_ENV } from '@/config';

const globalForRedis = global as unknown as { redis: RedisInstanceType };

export const redis =
  globalForRedis.redis ||
  new Redis({
    host: '127.0.0.1',
    port: 6379,
    keyPrefix: 'fuxiaochen:',
  });

if (NODE_ENV !== 'production') globalForRedis.redis = redis;
