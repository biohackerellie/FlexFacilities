/***
 *  Default Middleware for the application
 *  Middleware is an edge function that runs before any req to specified paths throughout the application
 * 	Middleware can be used to redirect, rewrite, or block reqs
 * 	Middleware can be used to check for authentication, authorization, or other conditions
 *  @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextRequest, NextResponse } from 'next/server';

// wrap default middleware with withAuth to provide NextAuth Token context to middleware
export function proxy(req: NextRequest) {
  const response = NextResponse.next();
  /**
   * A path was changed during some refactoring, and this
   * redirect catches the old path and redirects to the new one.
   */
  if (req.nextUrl.pathname.startsWith('/admin/reservations/')) {
    const path = req.nextUrl.pathname;
    const segments = path.split('/');
    const index = segments.findIndex((segment) => segment === 'reservations');
    const paramValue = segments[index + 1];
    if (paramValue) {
      return NextResponse.rewrite(
        new URL(`/reservation/${paramValue}`, req.url),
      );
    }
  }

  return response;
}

// The matcher property is used to specify which paths the middleware should run on.
export const config = {
  matcher: [
    {
      source: '/((?!api|trpc|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
