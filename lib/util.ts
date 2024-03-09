import toast from 'react-hot-toast';

import { format, toDate } from 'date-fns';

export const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到粘贴板');
    } catch (error) {
      toast.error(error as string);
    }
  } else {
    toast.error('浏览器不支持 Clipboard API');
  }
};

export const formatDateDetail = (date: number | Date) => {
  const newDate = toDate(date);

  return format(newDate, 'MMMM dd, yyyy, EEEE, HH:mm:ss');
};

export const formatDateSimple = (date: number | Date) => {
  const newDate = toDate(date);

  return format(newDate, 'MMMM dd, yyyy, EEEE');
};
