import qs from 'qs';

export function obj2QueryString(
  data: Record<
    string,
    string | number | boolean | string[] | number[] | undefined
  >,
): string {
  Object.keys(data).forEach((key) => {
    // 去除值为空字符串的key
    if (!data[key] && data[key] === '') {
      delete data[key];
    }
  });

  return qs.stringify(data, {
    addQueryPrefix: true,
    strictNullHandling: true,
    skipNulls: true,
  });
}
