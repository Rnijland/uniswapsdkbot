/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Enable the experimental appDir feature for app router
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['fs', 'path']
  },
  env: {
    PROJECT_ROOT: process.cwd(),
  },
};

module.exports = nextConfig;