import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  const publicPaths = ['/_next/', '/favicon.ico', '/robots.txt', '/manifest.json', '/api/'];
  if (publicPaths.some(p => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Handle root domain normally
  if (hostname === 'krave.me' || hostname === 'www.krave.me') {
    return NextResponse.next();
  }

  // 🔁 Redirect www.subdomain.krave.me → subdomain.krave.me (optional)
  if (hostname.startsWith('www.') && hostname.endsWith('.krave.me')) {
    const redirectUrl = `https://${hostname.replace('www.', '')}${url.pathname}`;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // ✅ Extract and route subdomain
  const subdomain = hostname.replace('.krave.me', '').replace('www.', '');
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
