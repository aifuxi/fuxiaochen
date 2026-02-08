import { format } from "date-fns";

export function formatDate(date: Date | number) {
  return format(date, "yyyy 年 MM 月 dd 日");
}

export function formatDateWithTime(date: Date | number) {
  return format(date, "yyyy 年 MM 月 dd 日 HH:mm:ss");
}

export function formatSimpleDate(date: Date | number) {
  return format(date, "yyyy-MM-dd");
}

export function formatSimpleDateWithTime(date: Date | number) {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}
