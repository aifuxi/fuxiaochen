"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import type { ImageProps } from "next/image";

import {
  DEFAULT_BLOG_COVER_IMAGE,
  resolveBlogCoverImage,
} from "@/lib/blog-cover-image";

type BlogCoverImageProps = Omit<ImageProps, "onError" | "src"> & {
  src?: string | null;
};

export function BlogCoverImage({ src, alt, ...props }: BlogCoverImageProps) {
  const resolvedSrc = resolveBlogCoverImage(src);
  const [imageSrc, setImageSrc] = useState(resolvedSrc);

  useEffect(() => {
    setImageSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <Image
      loading="eager"
      {...props}
      src={imageSrc}
      alt={alt}
      onError={() => {
        if (imageSrc !== DEFAULT_BLOG_COVER_IMAGE) {
          setImageSrc(DEFAULT_BLOG_COVER_IMAGE);
        }
      }}
    />
  );
}
