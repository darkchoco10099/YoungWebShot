/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 允许 @sparticuz/chromium 被正确打包
      config.externals = config.externals || [];
      // 移除对 @sparticuz/chromium 的外部化，让它被打包进函数
      config.externals = config.externals.filter(
        (external) => external !== '@sparticuz/chromium'
      );
    }
    return config;
  },
};

export default nextConfig;