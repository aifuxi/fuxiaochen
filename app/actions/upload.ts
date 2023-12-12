'use server';

import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

import { aliOSS } from '@/libs/ali-oss';
import { isProduction } from '@/utils/helper';

const saveFile = async (file: File) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const timePrefix = format(new Date(), 'yyyy-MM');
  const baseURL = `/uploads/${timePrefix}_${file.name}`;
  const filePath = path.join(process.cwd(), 'public', baseURL);

  fs.writeFileSync(filePath, Buffer.from(fileArrayBuffer));

  return baseURL;
};

export async function uploadFile(formData: FormData) {
  // Get file from formData
  const file = formData.get('file') as File;

  let url: string;
  if (isProduction()) {
    const timePrefix = format(new Date(), 'yyyy-MM');
    const filename = `images/${timePrefix}/${file.name}`;
    const fileArrayBuffer = await file.arrayBuffer();
    const { name } = await aliOSS.put(filename, Buffer.from(fileArrayBuffer));
    url = aliOSS.generateObjectUrl(name);
  } else {
    url = await saveFile(file);
  }

  return url;
}
