/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  assetPrefix: '',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.output.publicPath = './';
    return config;
  },
};

export default nextConfig;
