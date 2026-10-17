import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
  output: "standalone",
  redirects() {
    // 旧栏目合并到文章页；Next 保留原查询参数，包括筛选条件和追踪参数。
    return [
      { source: "/categories", destination: "/posts", permanent: true },
      { source: "/tags", destination: "/posts", permanent: true },
    ];
  },
  // node-gyp-build 动态选择原生文件，显式保留当前构建平台及源码编译产物。
  outputFileTracingIncludes: {
    "/*": [
      `./node_modules/argon2/prebuilds/${process.platform}-${process.arch}/*.node`,
      "./node_modules/argon2/build/Release/*.node",
      `./node_modules/better-sqlite3/prebuilds/${process.platform}-${process.arch}.node`,
      "./node_modules/better-sqlite3/build/Release/*.node",
      // 显式保留 schema 校验读取的 SQL 与 journal；drizzle-kit 仅在开发依赖。
      "./drizzle/*.sql",
      "./drizzle/meta/_journal.json",
    ],
  },
  // highlight.js 会读取正则源码拼接规则，Unicode 属性展开会破坏其分组计数。
  transpilePackages: ["highlight.js"],
  experimental: {
    swcEnvOptions: { exclude: ["transform-unicode-property-regex"] },
  },
};

export default nextConfig;
