// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // ✅ Exclude static files and API routes from subdomain rewrites
  const excludedPaths = [
    '/_next/',
    '/favicon.ico',
    '/api/',
    '/robots.txt',
    '/manifest.json',
  ];
  if (excludedPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ Skip during local dev or preview domains
  if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
    return NextResponse.next();
  }

  const subdomain = hostname.replace('.krave.me', '').replace('www.', '');
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
