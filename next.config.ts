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
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-slider',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-slot',
    ],
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Production source maps (disabled for smaller builds)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
