// next.config.js
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async rewrites() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: '(?<subdomain>[^.]+)\\.yourdomain\\.com' }],
      destination: '/:subdomain/:path*',
    },
  ];
},

};

module.exports = nextConfig;
