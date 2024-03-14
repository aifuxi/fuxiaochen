import { type ClassValue, clsx } from 'clsx';
import { format, toDate } from 'date-fns';
import slugify from 'slugify';
import { twMerge } from 'tailwind-merge';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

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

export const toDetailDateString = (date: number | Date) => {
  const newDate = toDate(date);

  return format(newDate, 'MMMM dd, yyyy, EEEE, HH:mm:ss');
};

export const toSimpleDateString = (date: number | Date) => {
  const newDate = toDate(date);

  return format(newDate, 'MMMM dd, yyyy');
};

export const toSlashDateString = (date: number | Date) => {
  const newDate = toDate(date);

  return format(newDate, 'yyyy/MM/dd HH:mm:ss');
};
