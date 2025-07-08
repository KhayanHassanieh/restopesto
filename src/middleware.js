// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ✅ Skip middleware for local dev and Vercel previews
  if (hostname.includes('localhost') || hostname.includes('vercel.app') || hostname.includes('192.168.16.188')) {
    return NextResponse.next();
  }

  // ✅ Allow static files and API routes to pass through
  const excludedPaths = [
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json',
    '/api/',
  ];
  if (excludedPaths.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ Don't rewrite for main domains
  if (hostname === 'krave.me' || hostname === 'www.krave.me') {
    return NextResponse.next();
  }

  // ✅ Redirect www.subdomain.krave.me → subdomain.krave.me
  if (hostname.startsWith('www.') && hostname.endsWith('.krave.me')) {
    const cleanHost = hostname.replace('www.', '');
    const redirectUrl = `https://${cleanHost}${url.pathname}`;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // ✅ Handle real subdomain: rewrite to /[subdomain] route
  const subdomain = hostname.replace('.krave.me', '').replace('www.', '');
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
