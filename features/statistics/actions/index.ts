'use server';

import {
  REDIS_BLOG_UNIQUE_VISITOR,
  REDIS_PAGE_VIEW,
  REDIS_SNIPPET_UNIQUE_VISITOR,
  REDIS_UNIQUE_VISITOR,
} from '@/constants';
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

export const recordUV = async (cid?: string) => {
  if (!cid) {
    return;
  }
  await redis.sadd(REDIS_UNIQUE_VISITOR, cid);
};

export const getUV = async () => {
  const uv = await redis.scard(REDIS_UNIQUE_VISITOR);
  return uv;
};

export const recordBlogUV = async (blogID?: string, cid?: string) => {
  if (!blogID || !cid) {
    return;
  }
  await redis.sadd(`${REDIS_BLOG_UNIQUE_VISITOR}:${blogID}`, cid);
};

export const getBlogUV = async (blogID?: string) => {
  if (!blogID) {
    return;
  }
  const uv = await redis.scard(`${REDIS_BLOG_UNIQUE_VISITOR}:${blogID}`);
  return uv;
};

export const batchGetBlogUV = async (blogIDs?: string[]) => {
  if (!blogIDs?.length) {
    return;
  }

  const m = new Map<string, number>();
  for (const id of blogIDs) {
    const uv = await redis.scard(`${REDIS_BLOG_UNIQUE_VISITOR}:${id}`);
    m.set(id, uv);
  }

  return m;
};

export const recordSnippetUV = async (snippetID?: string, cid?: string) => {
  if (!snippetID || !cid) {
    return;
  }
  await redis.sadd(`${REDIS_SNIPPET_UNIQUE_VISITOR}:${snippetID}`, cid);
};

export const getSnippetUV = async (snippetID?: string) => {
  if (!snippetID) {
    return;
  }
  const uv = await redis.scard(`${REDIS_SNIPPET_UNIQUE_VISITOR}:${snippetID}`);
  return uv;
};

export const batchGetSnippetUV = async (snippetIDs?: string[]) => {
  if (!snippetIDs?.length) {
    return;
  }

  const m = new Map<string, number>();
  for (const id of snippetIDs) {
    const uv = await redis.scard(`${REDIS_SNIPPET_UNIQUE_VISITOR}:${id}`);
    m.set(id, uv);
  }

  return m;
};
