import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */
const config = {
  // build 阶段禁止 eslint
  eslint: { ignoreDuringBuilds: true },
  // build 阶段禁止 ts 类型检查
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 开发模式默认会开启 React Strict Mode，会渲染2次，我们不需要
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.aliyuncs.com",
      },
      {
        protocol: "http",
        hostname: "**.aliyuncs.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  experimental: {
    // 解决 next build 报错: Error [ERR_REQUIRE_ESM]: require() of ES Module shiki/dist/index.mjs not supported.
    // 参考 issue: https://github.com/vercel/next.js/issues/64434#issuecomment-2082964050
    // 参考 issue: https://github.com/vercel/next.js/issues/64434#issuecomment-2084270758
    optimizePackageImports: ["shiki"],
  },
};

export default withBundleAnalyzer(config);
