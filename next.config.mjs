/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Nonaktifkan cache webpack di mode development untuk menghindari error "Cannot find module" di Windows
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
