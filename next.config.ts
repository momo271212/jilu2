import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 使用自己的无服务器运行时，不需要 standalone 输出
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
