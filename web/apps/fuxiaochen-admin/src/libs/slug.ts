import slugify from "slugify";

export const toSlug = (s: string) => {
  if (!s) {
    return "";
  }

  return slugify(s, {
    lower: true,
  });
};
