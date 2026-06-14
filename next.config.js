/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // data/ 폴더를 Next.js 번들에서 제외 (API route에서만 fs로 읽음)
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};
module.exports = nextConfig;
