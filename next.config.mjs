import path from 'node:path';
import url from 'node:url';

/** @type {import("next").NextConfig} */
const config = {
  sassOptions: {
    includePaths: [path.join(url.fileURLToPath(import.meta.url), 'styles')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.aliyuncs.com',
      },
      {
        protocol: 'http',
        hostname: '**.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'http',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default config;
