import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('[middleware] Checking authentication');

  const token =
    request.cookies.get('next-auth.session-token')?.value || // dev
    request.cookies.get('__Secure-next-auth.session-token')?.value; // prod

  // If user is on /Login or /Signup and already has a session, redirect to /Home
  const { pathname } = new URL(request.url);
  if (token && (pathname === '/Login' || pathname === '/')) {
    console.log('[middleware] Session exists, redirecting to /Home');
    return NextResponse.redirect(new URL('/Home', request.url));
  }

  if (!token && !['/Login', '/Signup'].includes(pathname)) {
    console.log('[middleware] No token found, redirecting');
    return NextResponse.redirect(new URL('/Login', request.url));
  }

  console.log('[middleware] Access allowed');
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(Home|Dashboard|Report|Doctor|Admin|prescription)(/.*)?'],
};
