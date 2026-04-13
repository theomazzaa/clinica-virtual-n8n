import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Garantiza que NextAuth v5 encuentre AUTH_SECRET aunque solo exista NEXTAUTH_SECRET
  env: {
    AUTH_SECRET:
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET ??
      "",
  },
};

export default nextConfig;
