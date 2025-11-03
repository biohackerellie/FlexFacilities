import { type NextRequest, NextResponse } from 'next/server';

export function proxy(_req: NextRequest) {
  const response = NextResponse.next();

  return response;
}

// The matcher property is used to specify which paths the middleware should run on.
export const config = {
  matcher: [
    {
      source: '/((?!trpc|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
