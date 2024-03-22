const siteUrl = process.env.SITE_URL || 'https://fuxiaochen.com';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  // 以/admin/*的路由不生成sitemap
  exclude: ['/admin/*', '/auth/*', '/server-sitemap.xml'],
  generateRobotsTxt: true, // (optional)
  // ...other options
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
      },
      {
        disallow: ['/admin/', '/admin/*'],
      },
      {
        disallow: ['/auth/', '/auth/*'],
      },
      {
        allow: '/',
      },
    ],
  },
};
