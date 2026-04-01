import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/harmoniq-rest-hours-demo",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
