import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Target modern browsers to reduce legacy JavaScript polyfills
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize for modern browsers
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog', '@radix-ui/react-slider'],
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
