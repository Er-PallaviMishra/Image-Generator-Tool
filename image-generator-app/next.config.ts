import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // true only if you want to deploy despite TS errors
  },  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "technioz.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "genpic.technioz.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
