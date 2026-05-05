import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://my-cigar-cellar.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;