import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

import { croppedImageStyle, imageCrop } from "./image-layout";

const imageElement = (element: HTMLElement) =>
  element.tagName === "IMG" ? element : element.querySelector("img");

const dimension = (name: "width" | "height") => ({
  default: null,
  parseHTML: (element: HTMLElement) => {
    const value = Number(imageElement(element)?.getAttribute(name));
    return Number.isInteger(value) && value >= 1 && value <= 10_000 ? value : null;
  },
});

// 共享节点负责合法 HTML 往返；编辑视图由客户端注入，不让 React NodeView 进入服务端。
export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null, parseHTML: (el: HTMLElement) => imageElement(el)?.getAttribute("src") },
      alt: { default: null, parseHTML: (el: HTMLElement) => imageElement(el)?.getAttribute("alt") },
      title: {
        default: null,
        parseHTML: (el: HTMLElement) => imageElement(el)?.getAttribute("title"),
      },
      width: dimension("width"),
      height: dimension("height"),
      caption: {
        default: null,
        rendered: false,
        parseHTML: (el: HTMLElement) => imageElement(el)?.getAttribute("data-caption") ?? null,
      },
      crop: {
        default: null,
        rendered: false,
        parseHTML: (el: HTMLElement) => {
          try {
            return imageCrop(JSON.parse(imageElement(el)?.getAttribute("data-crop") ?? "null"));
          } catch {
            return null;
          }
        },
      },
    };
  },
  parseHTML() {
    // 把整个图片容器解析成一个节点，避免复制时将图注重复粘贴为普通正文。
    return [{ tag: "span[data-article-image]" }, ...(this.parent?.() ?? [])];
  },
  renderHTML({ node, HTMLAttributes }) {
    const crop = imageCrop(node.attrs.crop);
    const caption = typeof node.attrs.caption === "string" ? node.attrs.caption : null;
    if (!crop && caption === null)
      return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    const dimensions =
      node.attrs.width && node.attrs.height
        ? `width: ${node.attrs.width}px; aspect-ratio: ${node.attrs.width} / ${node.attrs.height}`
        : "";
    const style = Object.entries(croppedImageStyle(crop))
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
    return [
      "span",
      { "data-article-image": "", class: "article-image-node" },
      [
        "span",
        { class: "article-image-viewport", style: dimensions },
        [
          "img",
          mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
            "data-caption": caption,
            "data-crop": crop ? JSON.stringify(crop) : null,
            style: crop ? `position: absolute; ${style}; max-width: none` : undefined,
          }),
        ],
      ],
      ...(caption !== null ? [["span", { class: "article-image-caption" }, caption] as const] : []),
    ];
  },
});
