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
};

export default nextConfig;
