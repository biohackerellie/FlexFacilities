import { type NextRequest, NextResponse } from 'next/server';
import { logger } from './lib/logger';

export function proxy(req: NextRequest) {
  const response = NextResponse.next();
  const path = req.nextUrl.pathname;
  /* CSRF Protection */
  if (req.method !== 'GET') {
    const originHeader = req.headers.get('Origin');
    const hostHeader =
      req.headers.get('Host') ?? req.headers.get('X-Forwarded-Host');

    if (originHeader === null || hostHeader === null) {
      console.error('Origin or Host header is missing');
      return new NextResponse(null, {
        status: 403,
      });
    }
    let origin: URL;
    try {
      origin = new URL(originHeader);
    } catch {
      console.error('Origin header is invalid');
      return new NextResponse(null, {
        status: 403,
      });
    }
    if (origin.host !== hostHeader) {
      console.error('Origin and Host header do not match');
      return new NextResponse(null, {
        status: 403,
      });
    }
  }
  /* End CSRF Protection */
  if (
    path.startsWith('/facilities') ||
    path.startsWith('/calendar') ||
    path.startsWith('/login') ||
    path === '/'
  ) {
    return response;
  }
  logger.info('Proxying unauthenticated request', {
    path: path,
    method: req.method,
    origin: req.headers.get('Origin'),
    host: req.headers.get('Host'),
  });
  return NextResponse.redirect(new URL('/login', req.url));
}

// The matcher property is used to specify which paths the middleware should run on.
export const config = {
  matcher: [
    {
      source: '/((?!api|trpc|_next/static|_next/image|favicon.ico|logo.png).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
        { type: 'cookie', key: 'flexauth_token' },
      ],
    },
  ],
};
