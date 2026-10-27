import type { NextConfig } from "next";
import { BASELINE_SECURITY_HEADERS, buildPublicCsp } from "./lib/http/csp";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: BASELINE_SECURITY_HEADERS,
      },
      {
        // Admin pages get a stricter per-request nonce policy from proxy.ts
        // instead — two CSP headers would intersect rather than override.
        source: "/((?!admin).*)",
        headers: [{ key: "Content-Security-Policy", value: buildPublicCsp() }],
      },
    ];
  },
};

export default nextConfig;
