import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function localFormatDistanceToNow(date: string | number | Date) {
  return formatDistanceToNow(date, {
    locale: zhCN,
    addSuffix: true,
  });
}
