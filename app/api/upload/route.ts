import { format } from 'date-fns';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import aliOSS from '@/libs/ali-oss';
import type { URLStruct } from '@/types';
import { createSuccessResponse, isProduction } from '@/utils';

const saveFile = async (file: File) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const timePrefix = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
  const baseURL = `/uploads/${timePrefix}-${file.name}`;
  const filePath = path.join(process.cwd(), 'public', baseURL);

  fs.writeFileSync(filePath, Buffer.from(fileArrayBuffer));

  return baseURL;
};

export async function POST(req: Request) {
  // Get formData from request
  const formData = await req.formData();

  // Get file from formData
  const file = formData.get('file') as File;

  let url: string;
  if (isProduction()) {
    const timePrefix = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    const filename = `images/${timePrefix}_${file.name}`;
    const fileArrayBuffer = await file.arrayBuffer();
    const { name } = await aliOSS.put(filename, Buffer.from(fileArrayBuffer));
    url = aliOSS.generateObjectUrl(name);
  } else {
    url = await saveFile(file);
  }

  return NextResponse.json(createSuccessResponse<URLStruct>({ url }));
}
