import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "pub-449628d08210466891a47d6feb22ed65.r2.dev", pathname: "/**" },
    ],
  },
};

export default nextConfig;
