import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
  output: "standalone",
  // node-gyp-build 动态选择原生文件，显式保留当前构建平台及源码编译产物。
  outputFileTracingIncludes: {
    "/*": [
      `./node_modules/argon2/prebuilds/${process.platform}-${process.arch}/*.node`,
      "./node_modules/argon2/build/Release/*.node",
    ],
  },
  // highlight.js 会读取正则源码拼接规则，Unicode 属性展开会破坏其分组计数。
  transpilePackages: ["highlight.js"],
  experimental: {
    swcEnvOptions: { exclude: ["transform-unicode-property-regex"] },
  },
};

export default nextConfig;
