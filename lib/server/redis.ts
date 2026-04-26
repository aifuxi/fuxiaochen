import Redis from "ioredis";

const DEFAULT_REDIS_URL = "redis://localhost:6379";

const globalForRedis = globalThis as typeof globalThis & {
  __fuxiaochenRedis?: Redis;
};

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL ?? DEFAULT_REDIS_URL, {
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  client.on("error", () => {
    // Redis availability is handled at call sites so content APIs can degrade.
  });

  return client;
}

export async function getRedisClient() {
  const client = globalForRedis.__fuxiaochenRedis ?? createRedisClient();
  globalForRedis.__fuxiaochenRedis = client;

  if (
    client.status === "wait" ||
    client.status === "close" ||
    client.status === "end"
  ) {
    await client.connect();
  }

  return client;
}
