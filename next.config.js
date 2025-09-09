/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add font optimization settings
  optimizeFonts: true,
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    // Fix for chunk loading errors
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Ignore warnings about dynamic imports
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  experimental: {
    // Disable some experimental features that might cause issues
    optimizeCss: false,
    workerThreads: false,
  },
};

module.exports = nextConfig;
