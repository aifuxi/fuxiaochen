import { type NextConfig } from "next";

import NextBundleAnalyzer from "@next/bundle-analyzer";

import { env } from "./lib/env";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: env.ANALYZE,
});

const config: NextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
};

export default withBundleAnalyzer(config);
