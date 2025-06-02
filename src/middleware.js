// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip subdomain logic when running locally
  if (hostname.includes('localhost')) {
    return NextResponse.next();
  }

  // Extract subdomain from live domain (e.g. spaceresto.krave.me)
  const subdomain = hostname.replace('.krave.me', '').replace('.www', '');

  // Rewrite to /subdomain-style routing
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
