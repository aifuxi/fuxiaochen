const DEFAULT_PUBLIC_SITE_URL = "https://fuxiaochen.com";

const normalizeSiteUrl = (url) => {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return DEFAULT_PUBLIC_SITE_URL;
  }

  return trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : trimmedUrl;
};

const getPublicSiteUrl = () =>
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

const getAbsoluteSiteUrl = (pathname) =>
  new URL(pathname, `${getPublicSiteUrl()}/`).href;

module.exports = {
  DEFAULT_PUBLIC_SITE_URL,
  getAbsoluteSiteUrl,
  getPublicSiteUrl,
  normalizeSiteUrl,
};
