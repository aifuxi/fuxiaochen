import { format, formatDistanceToNow, getHours, toDate } from "date-fns";
import { zhCN } from "date-fns/locale";
import slugify from "slugify";

import { type BaseResponse } from "@/types";

import { showErrorToast, showSuccessToast } from "@/components/toast";

export const toSlug = (s: string) => {
  if (!s) {
    return "";
  }

  return slugify(s, {
    lower: true,
  });
};

export const copyToClipboard = (text: string) => {
  // 实测 Clipboard API 在 iPhone 上不支持，可恶！
  if (navigator.clipboard) {
    navigator.clipboard
      // 去除首尾空白字符
      .writeText(text.trim())
      .then(() => {
        showSuccessToast("已复制到粘贴板");
      })
      .catch((error) => {
        showErrorToast(error as string);
      });
  } else {
    // 以下代码来自：https://www.zhangxinxu.com/wordpress/2021/10/js-copy-paste-clipboard/
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = "fixed";
    textarea.style.clip = "rect(0 0 0 0)";
    textarea.style.top = "10px";
    // 赋值，手动去除首尾空白字符
    textarea.value = text.trim();
    // 选中
    textarea.select();
    // 复制
    document.execCommand("copy", true);
    showSuccessToast("已复制到粘贴板");
    // 移除输入框
    document.body.removeChild(textarea);
  }
};

export const toFromNow = (date: number | Date) => {
  return formatDistanceToNow(date, { locale: zhCN });
};

export const toSlashDateString = (date: number | Date) => {
  return format(date, "yyyy年MM月dd日 HH:mm:ss");
};

export const prettyDate = (date: number | Date) => {
  return format(date, "MM月 dd，yyyy");
};

export function toDateString(date: number | Date) {
  return format(toDate(date), "yyyy年MM月dd日");
}

export function toTimeString(date: number | Date) {
  return format(toDate(date), "HH:mm");
}

export function toDateTimeString(date: number | Date) {
  return format(toDate(date), "yyyy/MM/dd HH:mm:ss");
}

/* 根据当前时间显示不同的问候语 */
export const sayHi = () => {
  const hour = getHours(new Date());

  if (hour < 6) {
    return "凌晨好~";
  } else if (hour < 9) {
    return "早上好~";
  } else if (hour < 12) {
    return "上午好~";
  } else if (hour < 14) {
    return "中午好~";
  } else if (hour < 17) {
    return "下午好~";
  } else if (hour < 19) {
    return "傍晚好~";
  } else {
    return "晚上好~";
  }
};

export const prettyDateWithWeekday = (date: number | Date) => {
  return format(date, "yyyy年MM月dd日, eeee", { locale: zhCN });
};

export const isBrowser = () => {
  // 代码来自：https://ahooks.js.org/zh-CN/guide/blog/ssr

  return !!(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
  );
};

export function createResp<T>({ data, error, message }: BaseResponse<T>) {
  return {
    data,
    error,
    message,
    timestamp: new Date().toString(),
  };
}

export function createResponse<T>({ data, error, message }: BaseResponse<T>) {
  return Response.json(createResp({ data, error, message }));
}
