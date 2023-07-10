import { HttpMethod } from '@/constants';
import type { GeneralResponse, URLStruct } from '@/types';

export const UPLOAD_URL = '/api/upload';

export async function uploadFile(data: FormData) {
  const res = await fetch(`${UPLOAD_URL}`, {
    method: HttpMethod.POST,
    body: data,
  });
  return res.json() as unknown as GeneralResponse<URLStruct | undefined>;
}
