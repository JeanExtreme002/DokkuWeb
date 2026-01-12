/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true, // disables incompatible Image Optimization API
  },
  trailingSlash: true, // Optional: recommended for gh-pages compatibility
  env: {
    WEBSITE_TITLE: process.env.WEBSITE_TITLE,
    WEBSITE_SUBTITLE: process.env.WEBSITE_SUBTITLE,
    SUPPORT_NAME: process.env.SUPPORT_NAME,
    SUPPORT_URL: process.env.SUPPORT_URL,
    SERVER_DOMAIN: process.env.SERVER_DOMAIN,
    EMAIL_DOMAINS: process.env.EMAIL_DOMAINS,
  },
};

export default nextConfig;
