import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth middleware that checks if the user is authenticated
 * by verifying if a specific auth cookie is present.
 * Redirects to login page if not authenticated.
 */
export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('token');
  
  if (!authCookie) {
    const url = request.nextUrl.clone();
    const returnUrl = encodeURIComponent(url.pathname + url.search);
    
    const loginUrl = new URL(`/auth/login?returnUrl=${returnUrl}`, request.url);
    
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

/**
 * Configure which paths this middleware should run on
 * This example runs on all paths except those specified
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - static files
     * - auth pages (so we don't create a redirect loop)
     * - non-auth public pages
     */
    '/((?!api|_next/static|_next/image|auth/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};