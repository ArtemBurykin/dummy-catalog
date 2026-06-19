import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://back:8080', // The upstream API URL
      },
    ];
  },
};

export default nextConfig;
