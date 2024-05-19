import { toSrcset } from 'mini-svg-data-uri';

// 提取 url 中顶级域名
// eg: https://www.example.com/path/to/page => example.com
// eg: https://space.bilibili.com/xxxxx => bilibili.com
export const extractDomainFromUrl = (urlString: string) => {
  const url = new URL(urlString);
  const hostnameParts = url.hostname.split('.');
  if (hostnameParts.length >= 2) {
    return hostnameParts.slice(-2).join('.');
  } else {
    return url.hostname;
  }
};

export const convertSvgToDataUrl = (svgString?: string) => {
  if (!svgString) {
    return '';
  }

  if (!svgString?.startsWith('<svg')) {
    return svgString;
  }

  return toSrcset(svgString);
};
