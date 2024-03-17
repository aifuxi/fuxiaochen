import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import slugify from 'slugify';
import { twMerge } from 'tailwind-merge';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { ADMIN_EMAILS } from '@/constants';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const toSlug = (s: string) => {
  if (!s) {
    return '';
  }

  return slugify(s, {
    lower: true,
  });
};

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccessToast('已复制到粘贴板');
      })
      .catch((error) => {
        showErrorToast(error as string);
      });
  } else {
    showErrorToast('浏览器不支持 Clipboard API');
  }
};

export const toSimpleDateString = (date: number | Date) => {
  return dayjs(date).locale('zh-cn').format('YYYY年M月D日');
};

export const toSlashDateString = (date: number | Date) => {
  return dayjs(date).locale('zh-cn').format('YYYY年M月D日 dddd HH:mm:ss');
};

export const isAdmin = (email?: string | null) => {
  if (!email || !ADMIN_EMAILS?.length) {
    return false;
  }
  return ADMIN_EMAILS.includes(email);
};
