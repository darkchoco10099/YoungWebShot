/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 确保 @sparticuz/chromium 不被打包到客户端
      config.externals = config.externals || [];
      config.externals.push('@sparticuz/chromium');
    }
    return config;
  },
};

export default nextConfig;