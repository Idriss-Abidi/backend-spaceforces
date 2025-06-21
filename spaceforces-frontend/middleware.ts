// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// /**
//  * Auth middleware that checks if the user is authenticated
//  * by verifying if a specific auth cookie is present.
//  * Redirects to login page if not authenticated.
//  */
// export function middleware(request: NextRequest) {
//   // Skip middleware for auth pages to prevent redirect loops
//   if (request.nextUrl.pathname.startsWith('/auth/')) {
//     return NextResponse.next();
//   }

//   const authCookie = request.cookies.get('token');
  
//   if (!authCookie) {
//     const url = request.nextUrl.clone();
//     const returnUrl = encodeURIComponent(url.pathname + url.search);
    
//     const loginUrl = new URL(`/auth/login?returnUrl=${returnUrl}`, request.url);
    
//     return NextResponse.redirect(loginUrl);
//   }
  
//   return NextResponse.next();
// }

// /**
//  * Configure which paths this middleware should run on
//  * This example runs on all paths except those specified
//  */
// export const config = {
//   matcher: [
//     // Exclude all /auth/ paths explicitly to prevent redirect loops
//     '/((?!api|_next|static|auth/|favicon.ico|sitemap.xml|robots.txt).*)',
//   ],
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth middleware that checks if the user is authenticated.
 * Redirects to login if not authenticated, but avoids infinite loops.
 */
export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('token');

  const { pathname, search } = request.nextUrl;

  // ✅ Skip redirect loop: Do not redirect if already on login page
  if (pathname.startsWith('/auth/login')) {
    return NextResponse.next();
  }

  // ❌ Not authenticated
  if (!authCookie) {
    const returnUrl = encodeURIComponent(pathname + search);
    const loginUrl = new URL(`/auth/login?returnUrl=${returnUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Authenticated
  return NextResponse.next();
}

/**
 * Configure middleware paths
 */
export const config = {
  matcher: [
    // All pages except static, api, and auth routes
    '/((?!api|_next/static|_next/image|auth/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
