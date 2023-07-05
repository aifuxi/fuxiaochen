import { HttpMethod } from '@/constants';
import type {
  CreateTagRequest,
  GeneralResponse,
  GetTagsRequest,
  Tag,
  TotalResponse,
} from '@/types';
import { getBaseURL, obj2QueryString } from '@/utils';

export const TAG_URL = '/api/tag';

export async function getTags(data: GetTagsRequest) {
  const res = await fetch(`${getBaseURL()}${TAG_URL}${obj2QueryString(data)}`);
  return res.json() as unknown as TotalResponse<Tag[]>;
}

export async function getTag(id: string) {
  const res = await fetch(`${getBaseURL()}${TAG_URL}/${id}`, {
    method: HttpMethod.GET,
  });
  return res.json() as unknown as GeneralResponse<Tag | undefined>;
}

export async function createTag(data: CreateTagRequest) {
  const res = await fetch(`${TAG_URL}`, {
    method: HttpMethod.POST,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return res.json() as unknown as GeneralResponse<Tag | undefined>;
}

export async function deleteTag(id: string) {
  const res = await fetch(`${TAG_URL}/${id}`, { method: HttpMethod.DELETE });
  return res.json() as unknown as GeneralResponse<Tag>;
}

export async function updateTag(id: string, data: CreateTagRequest) {
  const res = await fetch(`${TAG_URL}/${id}`, {
    method: HttpMethod.PUT,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return res.json() as unknown as GeneralResponse<Tag | undefined>;
}
