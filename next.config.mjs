/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // disables incompatible Image Optimization API
  },
  trailingSlash: true, // Optional: recommended for gh-pages compatibility
};

export default nextConfig;
