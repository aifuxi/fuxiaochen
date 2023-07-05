import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { WEBSITE } from '@/constants';
import { GeneralResponse, TotalResponse } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSuccessResponse<T>(data: T): GeneralResponse<T> {
  return { code: 0, msg: 'success', data };
}

export function createSuccessTotalResponse<T>(
  data: T,
  total: number,
): TotalResponse<T> {
  return { code: 0, msg: 'success', data, total };
}

export function createFailResponse(
  errorMsg?: string,
): GeneralResponse<undefined> {
  return { code: -1, msg: 'fail', error: errorMsg ?? 'error' };
}

/**
 * 判断当前是不是服务端环境
 * @returns
 */
export function isServer() {
  return typeof window === 'undefined';
}

export function getBaseURL() {
  return isServer() ? process.env.BASE_URL : '';
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
