import { format, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function localFormatDistanceToNow(date: string | number | Date) {
  return formatDistanceToNow(date, {
    locale: zhCN,
    addSuffix: true,
  });
}

export function formatToDatetime(date: string | number | Date) {
  return format(date, "yyyy-MM-dd hh:mm:ss", {
    locale: zhCN,
  });
}
