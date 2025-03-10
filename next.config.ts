/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    // Warning: this disables ESLint during build
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    // Warning: this disables TypeScript checking during build
    ignoreBuildErrors: true,
  },
  // Configure webpack to handle node.js modules
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'fs', 'path'];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  // Server components external packages
  serverExternalPackages: ['fs', 'path'],
  env: {
    PROJECT_ROOT: process.cwd(),
  },
};

module.exports = nextConfig;