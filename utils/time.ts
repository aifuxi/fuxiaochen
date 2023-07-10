import { format } from 'date-fns';
import localCN from 'date-fns/locale/zh-CN';

export function formatToDate(date: number | Date): string {
  return format(date, 'yyyy年M月d日', {
    locale: localCN,
  });
}

export function formatToDateTime(date: number | Date): string {
  return format(date, 'yyyy年M月d日 HH时mm分秒', {
    locale: localCN,
  });
}
