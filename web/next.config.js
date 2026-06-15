/** Next.js config. `standalone` output emits a self-contained server bundle
 *  (.next/standalone) ideal for a minimal Docker runtime image.
 *  API base is injected at build via NEXT_PUBLIC_API_URL (defaults to /api so
 *  the browser calls same-origin and nginx proxies /api -> node server). */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api"
  }
};
module.exports = nextConfig;
