const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fuxiaochen.com";

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  // 以下路由不生成sitemap
  exclude: ["/api/*", "/server-sitemap.xml"],
  generateRobotsTxt: true, // (optional)
  // ...other options
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: [
      `${siteUrl}/server-sitemap.xml`, // <==== Add here
    ],
  },
};
