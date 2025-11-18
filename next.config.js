/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Ensure public files are copied during build
  // Next.js automatically copies /public to root in static export
};

module.exports = nextConfig;