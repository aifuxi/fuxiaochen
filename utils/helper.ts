import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { WEBSITE } from '@/constants/info';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 判断当前是不是服务端环境
 * @returns
 */
export function isServer() {
  return typeof window === 'undefined';
}

/**
 * 判断当前是不是生产环境
 * @returns
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * 判断当前是不是开发环境
 * @returns
 */
export function isDev() {
  return process.env.NODE_ENV === 'development';
}

/**
 * 生成页面title
 * @returns
 */
export function generatePageTitle(data?: string) {
  if (!data) {
    return WEBSITE;
  }
  return `${data} - ${WEBSITE}`;
}
