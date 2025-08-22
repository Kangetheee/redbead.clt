/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rbdapi.oleq.app",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wristbandskenya.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "brightwristbands.co.ke",
        port: "",
        pathname: "/**",
      },
      // Add other image domains your product images might use
      {
        protocol: "https",
        hostname: "5.imimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "badgeland.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Optional: Add experimental features if needed
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

module.exports = nextConfig;
