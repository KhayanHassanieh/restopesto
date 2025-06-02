// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ✅ Bypass static files, favicon, APIs
  const publicFiles = [
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json',
    '/api/',
  ];
  if (publicFiles.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ Skip local and vercel preview
  if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
    return NextResponse.next();
  }

  // ✅ Don't rewrite for krave.me or www.krave.me (root site)
  if (hostname === 'krave.me' || hostname === 'www.krave.me') {
    return NextResponse.next();
  }

  // ✅ Extract subdomain and rewrite
  const subdomain = hostname.replace('.krave.me', '').replace('www.', '');
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
