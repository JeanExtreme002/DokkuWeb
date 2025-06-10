/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true, // disables incompatible Image Optimization API
  },
  trailingSlash: true, // Optional: recommended for gh-pages compatibility
};

export default nextConfig;
