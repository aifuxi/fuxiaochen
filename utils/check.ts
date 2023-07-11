/**
 * 判断是否为undefined
 */
export const isUndefined = (value: any): value is undefined =>
  typeof value === 'undefined';

/**
 * 判断是否为null
 */
export const isNull = (value: any): value is null => value === null;

/**
 * 判断是否为null或undefined
 */
export const isNil = (value: any): value is null | undefined =>
  isNull(value) || isUndefined(value);
