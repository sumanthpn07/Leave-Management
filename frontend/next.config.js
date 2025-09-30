/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for dynamic routes to work properly
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
