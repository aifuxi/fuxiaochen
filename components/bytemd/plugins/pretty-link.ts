/* eslint-disable */
// @ts-nocheck
import type { BytemdPlugin } from "bytemd";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { visit } from "unist-util-visit";

import { extractDomainFromUrl } from "@/utils";

// fromHtmlIsomorphic的作用是把一个html标签转换成对应的HAST，简化书写svg的过程
// 超链接通用 svg icon node
const linkSvgNode = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6m0 0H9m9 0v9"/></svg>`,
);
// bilibili svg icon node
const bilibiliSvgNode = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 512 512"><path fill="#00AEEC" d="M488.6 104.1c16.7 18.1 24.4 39.7 23.3 65.7v202.4c-.4 26.4-9.2 48.1-26.5 65.1c-17.2 17-39.1 25.9-65.5 26.7H92.02c-26.45-.8-48.21-9.8-65.28-27.2C9.682 419.4.767 396.5 0 368.2V169.8c.767-26 9.682-47.6 26.74-65.7C43.81 87.75 65.57 78.77 92.02 78h29.38L96.05 52.19c-5.75-5.73-8.63-13-8.63-21.79c0-8.8 2.88-16.06 8.63-21.797C101.8 2.868 109.1 0 117.9 0s16.1 2.868 21.9 8.603L213.1 78h88l74.5-69.397C381.7 2.868 389.2 0 398 0c8.8 0 16.1 2.868 21.9 8.603c5.7 5.737 8.6 12.997 8.6 21.797c0 8.79-2.9 16.06-8.6 21.79L394.6 78h29.3c26.4.77 48 9.75 64.7 26.1m-38.8 69.7c-.4-9.6-3.7-17.4-10.7-23.5c-5.2-6.1-14-9.4-22.7-9.8H96.05c-9.59.4-17.45 3.7-23.58 9.8c-6.14 6.1-9.4 13.9-9.78 23.5v194.4c0 9.2 3.26 17 9.78 23.5s14.38 9.8 23.58 9.8H416.4c9.2 0 17-3.3 23.3-9.8c6.3-6.5 9.7-14.3 10.1-23.5zm-264.3 42.7c6.3 6.3 9.7 14.1 10.1 23.2V273c-.4 9.2-3.7 16.9-9.8 23.2c-6.2 6.3-14 9.5-23.6 9.5c-9.6 0-17.5-3.2-23.6-9.5c-6.1-6.3-9.4-14-9.8-23.2v-33.3c.4-9.1 3.8-16.9 10.1-23.2c6.3-6.3 13.2-9.6 23.3-10c9.2.4 17 3.7 23.3 10m191.5 0c6.3 6.3 9.7 14.1 10.1 23.2V273c-.4 9.2-3.7 16.9-9.8 23.2c-6.1 6.3-14 9.5-23.6 9.5c-9.6 0-17.4-3.2-23.6-9.5c-7-6.3-9.4-14-9.7-23.2v-33.3c.3-9.1 3.7-16.9 10-23.2c6.3-6.3 14.1-9.6 23.3-10c9.2.4 17 3.7 23.3 10"/></svg>`,
);
// 掘金 svg icon node
const juejinSvgNode = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24"><path fill="#2985fc" d="m12 14.316l7.454-5.88l-2.022-1.625L12 11.1l-.004.003l-5.432-4.288l-2.02 1.624l7.452 5.88Zm0-7.247l2.89-2.298L12 2.453l-.004-.005l-2.884 2.318l2.884 2.3Zm0 11.266l-.005.002l-9.975-7.87L0 12.088l.194.156l11.803 9.308l7.463-5.885L24 12.085l-2.023-1.624Z"/></svg>`,
);
// 某国外视频网站
const ytSvgNode = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.6em" viewBox="0 0 256 180"><path fill="#f00" d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134"/><path fill="#fff" d="m102.421 128.06l66.328-38.418l-66.328-38.418z"/></svg>`,
);
// github svg icon node
const githubSvgNode = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6c-3.3.3-5.6-1.3-5.6-3.6c0-2 2.3-3.6 5.2-3.6c3-.3 5.6 1.3 5.6 3.6m-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9c2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3m44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9c.3 2 2.9 3.3 5.9 2.6c2.9-.7 4.9-2.6 4.6-4.6c-.3-1.9-3-3.2-5.9-2.9M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2c12.8 2.3 17.3-5.6 17.3-12.1c0-6.2-.3-40.4-.3-61.4c0 0-70 15-84.7-29.8c0 0-11.4-29.1-27.8-36.6c0 0-22.9-15.7 1.6-15.4c0 0 24.9 2 38.6 25.8c21.9 38.6 58.6 27.5 72.9 20.9c2.3-16 8.8-27.1 16-33.7c-55.9-6.2-112.3-14.3-112.3-110.5c0-27.5 7.6-41.3 23.6-58.9c-2.6-6.5-11.1-33.3 2.6-67.9c20.9-6.5 69 27 69 27c20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27c13.7 34.7 5.2 61.4 2.6 67.9c16 17.7 25.8 31.5 25.8 58.9c0 96.5-58.9 104.2-114.8 110.5c9.2 7.9 17 22.9 17 46.4c0 33.7-.3 75.4-.3 83.6c0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252C496 113.3 383.5 8 244.8 8M97.2 352.9c-1.3 1-1 3.3.7 5.2c1.6 1.6 3.9 2.3 5.2 1c1.3-1 1-3.3-.7-5.2c-1.6-1.6-3.9-2.3-5.2-1m-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9c1.6 1 3.6.7 4.3-.7c.7-1.3-.3-2.9-2.3-3.9c-2-.6-3.6-.3-4.3.7m32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2c2.3 2.3 5.2 2.6 6.5 1c1.3-1.3.7-4.3-1.3-6.2c-2.2-2.3-5.2-2.6-6.5-1m-11.4-14.7c-1.6 1-1.6 3.6 0 5.9c1.6 2.3 4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2c-1.4-2.3-4-3.3-5.6-2"/></svg>`,
);
// stackoverflow svg icon node
const stackoverflowSvgNode = fromHtmlIsomorphic(
  `<svg xmlns="http://www.w3.org/2000/svg" width="0.68em" height="0.8em" viewBox="0 0 256 304"><path fill="#bcbbbb" d="M216.33 276.188v-81.211h26.953v108.165H0V194.977h26.954v81.211z"/><path fill="#f48023" d="m56.708 187.276l132.318 27.654l5.6-26.604L62.31 160.672zm17.502-63.009l122.517 57.058l11.202-24.503L85.412 99.414zm33.955-60.208l103.964 86.462l17.152-20.653l-103.964-86.462zM175.375 0L153.67 16.102l80.511 108.515l21.703-16.102zM53.906 248.884h135.119V221.93H53.907z"/></svg>`,
);

/**
 * 将内容里面的外部链接打开方式为_blank
 */
export const prettyLinkPlugin = (): BytemdPlugin => {
  return {
    rehype: (process) =>
      process.use(() => (tree) => {
        visit(tree, "element", (node) => {
          if (node.tagName === "a") {
            // 如果是以 # 开头，说明是hash，不做处理
            if (node.properties.href && node.properties.href.startsWith("#")) {
              return;
            }
            node.properties.target = "_blank";
            node.children.push(linkSvgNode);

            // 判断当前链接是哪种，是否为已知的网站，根据域名添加对应图标
            const host = extractDomainFromUrl(node.properties.href);
            const domainToSvgNodeMap = {
              "bilibili.com": bilibiliSvgNode,
              "juejin.cn": juejinSvgNode,
              "github.com": githubSvgNode,
              "youtube.com": ytSvgNode,
              "stackoverflow.com": stackoverflowSvgNode,
            };
            const svgNode = domainToSvgNodeMap[host];
            if (svgNode) {
              node.children.unshift(svgNode);
            }
          }
        });
      }),
  };
};
