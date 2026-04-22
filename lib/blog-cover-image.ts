export const DEFAULT_BLOG_COVER_IMAGE = "/blog-cover-fallback.svg";

export function resolveBlogCoverImage(src?: string | null): string {
  const normalizedSrc = src?.trim();

  if (!normalizedSrc) {
    return DEFAULT_BLOG_COVER_IMAGE;
  }

  return normalizedSrc;
}
