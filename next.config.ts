import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    // to use Lingui macros
    swcPlugins: [["@lingui/swc-plugin", {}]],
  },
  images: {
    remotePatterns: [
      new URL("https://github.com/shadcn.png"),
      // Local Supabase Storage
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      // Production Supabase Storage
      {
        protocol: "https",
        hostname: "skgjrluyrcnboekitvym.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  domains: [
    "api.microlink.io", // Microlink Image Preview
  ],
};

export default nextConfig;
