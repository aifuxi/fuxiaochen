import { format } from 'date-fns';

export function formatToDate(date: number | Date | string): string {
  let newDate: Date;
  if (typeof date === 'number' || typeof date === 'string') {
    newDate = new Date(date);
  } else {
    newDate = date;
  }

  return format(newDate, 'yyyy-MM-dd');
}
