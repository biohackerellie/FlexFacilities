import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const API_URL = 'http://0.0.0.0:8080';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = await params.then((x) => x.path.join('/'));

  const url = new URL(`/${path}`, API_URL);
  request.nextUrl.searchParams.forEach((value, key) =>
    url.searchParams.append(key, value),
  );

  const rheaders = new Headers(request.headers);
  rheaders.delete('host');
  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    console.log('cookie: ', cookie);
    rheaders.append('Cookie', `${cookie.name}=${cookie.value}`);
  }
  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: rheaders,
      body: request.body,
      duplex: 'half',
      redirect: 'manual',
    } as RequestInit);

    const responseHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      if (
        !['content-encoding', 'content-length', 'transfer-encoding'].includes(
          key.toLowerCase(),
        )
      ) {
        if (key.toLowerCase() === 'set-cookie') {
          console.log('cookie: ', value);
          cookieStore.set(
            `${value.split(';')[0]?.split('=')[0] ?? ''}`,
            `${value.split(';')[0]?.split('=')[1] ?? ''}`,
          );
        }
        responseHeaders.append(key, value);
      }
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return NextResponse.redirect(location, { status: response.status });
      }
    }
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error('Proxy error:', e);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PATCH = handler;
export const PUT = handler;
export const HEAD = handler;
export const OPTIONS = handler;
