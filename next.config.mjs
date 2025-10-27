/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true, // disables incompatible Image Optimization API
  },
  trailingSlash: true, // Optional: recommended for gh-pages compatibility
  env: {
    SUPPORT_NAME: process.env.SUPPORT_NAME,
    SUPPORT_URL: process.env.SUPPORT_URL,
    SERVER_DOMAIN: process.env.SERVER_DOMAIN,
  },
};

export default nextConfig;
