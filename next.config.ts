import type { NextConfig } from "next";

const cloudfrontUrl = "cdn.mamabima.com";

const nextConfig: NextConfig = {
  images: {
    // loader: "custom",
    // loaderFile: "./src/lib/images/loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: cloudfrontUrl },
      { protocol: "https", hostname: "d2tk6bz1ze3gs5.cloudfront.net" },
      { protocol: "https", hostname: "rbdapi.oleq.app" },
    ],
  },
  env: {
    NEXT_PUBLIC_CLOUDFRONT_URL: cloudfrontUrl,
  },
};

export default nextConfig;
