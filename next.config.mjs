const nextConfig = {
  async rewrites() {
    return [{
      source: '/:subdomain/:path*',
      destination: '/:path*'
    }];
  }
};