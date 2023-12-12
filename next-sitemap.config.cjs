const SITE_URL = process.env.SITE_URL;

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  // 以/admin/*的路由不生成sitemap
  exclude: ['/admin/*', '/server-sitemap.xml'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        // 不允许爬虫爬取admin页面
        disallow: ['/admin/'],
      },
    ],
    additionalSitemaps: [`${SITE_URL}/server-sitemap.xml`],
  },
};
