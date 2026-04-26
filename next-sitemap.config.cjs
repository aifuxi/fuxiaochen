const { getAbsoluteSiteUrl, getPublicSiteUrl } = require("./lib/site-url.cjs");

const siteUrl = getPublicSiteUrl();

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  // 以下路由不生成sitemap
  exclude: [
    "/api/*",
    "/admin",
    "/admin/*",
    "/login",
    "/register",
    "/server-sitemap.xml",
  ],
  generateRobotsTxt: true, // (optional)
  // ...other options
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*", "/admin", "/admin/*", "/login", "/register"],
      },
    ],
    additionalSitemaps: [getAbsoluteSiteUrl("/server-sitemap.xml")],
  },
};
