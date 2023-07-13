/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://aifuxi.cool',
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
    additionalSitemaps: ['https://aifuxi.cool/server-sitemap.xml'],
  },
};
