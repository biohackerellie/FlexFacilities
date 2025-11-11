import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// Parse Set-Cookie header to extract cookie options
function parseSetCookie(setCookieValue: string) {
  const parts = setCookieValue.split(';').map(p => p.trim());
  const [nameValue] = parts;
  const [name, value] = nameValue?.split('=') ?? ['', ''];

  const options: {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const [key, val] = part.split('=').map(s => s.trim());
    const lowerKey = key?.toLowerCase() ?? '';

    if (lowerKey === 'path') {
      options.path = val;
    } else if (lowerKey === 'domain') {
      options.domain = val;
    } else if (lowerKey === 'max-age') {
      options.maxAge = Number.parseInt(val ?? '0', 10);
    } else if (lowerKey === 'expires') {
      options.expires = new Date(val ?? '');
    } else if (lowerKey === 'httponly') {
      options.httpOnly = true;
    } else if (lowerKey === 'secure') {
      options.secure = true;
    } else if (lowerKey === 'samesite') {
      options.sameSite = val?.toLowerCase() as 'strict' | 'lax' | 'none';
    }
  }

  return { name, value, options };
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = await params.then((x) => x.path.join('/'));
  const apiHost = process.env.API_HOST ?? 'http://localhost';
  const apiPort = process.env.API_PORT ?? '8080';
  const url = new URL(`/${path}`, `${apiHost}:${apiPort}`);
  request.nextUrl.searchParams.forEach((value, key) =>
    url.searchParams.append(key, value),
  );

  const rheaders = new Headers(request.headers);
  rheaders.delete('host');
  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
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
        // Parse and set cookies properly with all attributes
        if (key.toLowerCase() === 'set-cookie') {
          const { name, value: cookieValue, options } = parseSetCookie(value);
          if (name && cookieValue) {
            cookieStore.set(name, cookieValue, options);
          }
        }
        // Forward all headers including Set-Cookie to browser
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
