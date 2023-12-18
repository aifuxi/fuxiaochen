import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/libs/env.mjs';

import { PLACEHOLDER_COVER } from '@/constants/unknown';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 1. 英文变成全小写
 * 2. 把空格和,\.。，“”"替换为 -
 * 3. 把除字母、数字、- 之外的字符都替换成空
 * 4. 以空格切分，再用 - 连接
 * 5. eg: I have a dream. => i-have-a-dream
 */
export function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[_\+\*\^@,\.。，“”"]/g, '-')
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .split(' ')
    .join('-');
}

export function getOpenGraphImage(cover?: string | null) {
  if (!cover || cover.startsWith('/')) {
    return `${env.SITE_URL}${PLACEHOLDER_COVER}`;
  }

  return cover;
}
