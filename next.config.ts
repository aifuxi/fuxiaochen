import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
  // highlight.js 会读取正则源码拼接规则，Unicode 属性展开会破坏其分组计数。
  transpilePackages: ["highlight.js"],
  experimental: {
    swcEnvOptions: { exclude: ["transform-unicode-property-regex"] },
  },
};

export default nextConfig;
