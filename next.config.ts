import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)", // all routes except api, static, image, favicon, robots.txt
        destination: "/shell",
      },
    ];
  },
  typescript:{
    ignoreBuildErrors: true,
  },
  eslint:{
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
