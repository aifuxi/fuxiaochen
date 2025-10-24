import { format, formatDistanceToNow, getHours, toDate } from "date-fns";
import { zhCN } from "date-fns/locale";
import slugify from "slugify";

import { type BaseResponse } from "@/types/base";

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
  return formatDistanceToNow(date, { locale: zhCN, addSuffix: true });
};

export const toSlashDate = (date: number | Date) => {
  return format(date, "yyyy/MM/dd");
};

export const prettyDate = (date: number | Date) => {
  return format(date, "MM月 dd，yyyy");
};

export function toDateString(date: number | Date) {
  return format(toDate(date), "yyyy年MM月dd日");
}

export function toYYYYMMDD(date: number | Date) {
  return format(toDate(date), "yyyy-MM-dd");
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

export function countWordsByRegex(markdownText: string) {
  // 简单的正则表达式，用于去除标题、加粗、斜体等标记
  let plainText = markdownText
    .replace(/```.*?```/gs, "") // 去除代码块
    .replace(/!\[.*?\]\(.*?\)/g, "") // 去除图片
    .replace(/\[.*?\]\(.*?\)/g, "$1") // 去除链接，保留链接文字
    .replace(/#+\s/g, "") // 去除标题
    .replace(/\*{1,2}(.*?)\*{1,2}/g, "$1") // 去除加粗和斜体
    .replace(/`/g, ""); // 去除行内代码

  // 统计字符数（中文字符和英文字符都算一个）
  return plainText.replace(/\s/g, "").length;
}

/**
 * 统计阅读时长（假设300字/分钟）
 * @param markdownText 包含Markdown格式的文本
 * @returns 阅读时长（分钟）
 */
export function calculateReadTime(markdownText: string) {
  const wordCount = countWordsByRegex(markdownText);
  const readTimeInMinutes = wordCount / 300;
  return Math.ceil(readTimeInMinutes);
}

/**
 * 判断是否更新（假设更新时间和创建时间相差超过5分钟）
 * @param createdAt 创建时间
 * @param updatedAt 更新时间
 * @returns 是否更新
 */
export function checkUpdate({
  createdAt,
  updatedAt,
}: {
  createdAt: Date;
  updatedAt: Date;
}) {
  return updatedAt.getTime() - createdAt.getTime() > 1000 * 60 * 5;
}
