import type { GeneralResponse, URLStruct } from '@/typings/params';

export const UPLOAD_URL = '/api/upload';

export async function uploadFile(data: FormData) {
  const res = await fetch(`${UPLOAD_URL}`, {
    method: 'POST',
    body: data,
  });

  return res.json() as unknown as GeneralResponse<URLStruct | undefined>;
}
