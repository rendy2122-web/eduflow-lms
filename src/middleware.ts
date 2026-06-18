import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Skip static files, images, next assets, favicon, and root
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/submissions') ||
    pathname.startsWith('/materials') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    /\.(png|jpg|jpeg|gif|svg|ico|txt|xml|webmanifest|json)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Skip global SaaS admin dashboard and inject saas-admin tenant ID
  if (pathname.startsWith('/saas-admin') || pathname.startsWith('/api/saas')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', 'saas-admin');
    requestHeaders.set('x-original-pathname', pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  // Extract first path segment
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0];

    // If the first segment is login (global bypass) or api (global APIs)
    if (firstSegment === 'login' || firstSegment === 'api') {
      const referer = request.headers.get('referer');
      let refererTenantId = '';
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          const refererPathname = refererUrl.pathname;
          const refSegments = refererPathname.split('/').filter(Boolean);
          if (refSegments.length > 0 && refSegments[0] !== 'dashboard' && refSegments[0] !== 'login' && refSegments[0] !== 'api' && refSegments[0] !== 'saas-admin') {
            refererTenantId = refSegments[0];
          }
        } catch (e) {
          console.error('[Middleware Referer Parse Error]:', e);
        }
      }

      if (refererTenantId) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-tenant-id', refererTenantId);
        requestHeaders.set('x-original-pathname', pathname);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          }
        });
      }

      return NextResponse.next();
    }

    // Otherwise, treat firstSegment as the tenantId
    const tenantId = firstSegment;
    const remainingPath = '/' + segments.slice(1).join('/');

    // Inject tenant id header and rewrite path internally
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenantId);
    requestHeaders.set('x-original-pathname', pathname);

    const newPath = remainingPath === '/' ? '/login' : remainingPath;
    url.pathname = newPath;

    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
