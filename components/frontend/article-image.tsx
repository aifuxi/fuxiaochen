import type { Node } from "@tiptap/pm/model";

import { croppedImageStyle, imageCrop } from "@/lib/posts/image-layout";

import { ArticleImageLink } from "./article-images";

export function ArticleImage({ node, index }: { node: Node; index?: number }) {
  const { src, alt, title, width, height } = node.attrs;
  const crop = imageCrop(node.attrs.crop);
  const caption = typeof node.attrs.caption === "string" ? node.attrs.caption : null;
  const image = (
    // oxlint-disable-next-line next/no-img-element -- 正文可含任意外链，保留原始资源和无损裁剪尺寸。
    <img
      src={src}
      alt={alt ?? ""}
      title={title ?? undefined}
      width={width ?? undefined}
      height={height ?? undefined}
      data-caption={caption ?? undefined}
      data-crop={crop ? JSON.stringify(crop) : undefined}
      style={
        crop
          ? {
              position: "absolute",
              ...croppedImageStyle(crop),
              maxWidth: "none",
            }
          : undefined
      }
    />
  );
  const viewport =
    crop || caption !== null ? (
      <span
        className="article-image-viewport"
        style={width && height ? { width, aspectRatio: `${width} / ${height}` } : undefined}
      >
        {image}
      </span>
    ) : (
      image
    );
  // 已有图片链接保留跳转含义；普通图片在无脚本时仍可打开原图。
  const trigger =
    index === undefined ? (
      viewport
    ) : (
      <ArticleImageLink
        src={src}
        index={index}
        label={`预览图片：${alt || caption || `第 ${index + 1} 张图片`}`}
      >
        {viewport}
      </ArticleImageLink>
    );
  return crop || caption !== null ? (
    <span data-article-image="" className="article-image-node">
      {trigger}
      {caption !== null && <span className="article-image-caption">{caption}</span>}
    </span>
  ) : (
    trigger
  );
}
