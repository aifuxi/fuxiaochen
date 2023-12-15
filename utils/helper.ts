import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    .replace(/[,\.。，“”"]/g, '-')
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .split(' ')
    .join('-');
}
