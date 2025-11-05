import type { Interceptor } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { cookies } from 'next/headers';
import { RPC } from './rpc';

const base = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/api`;

const transport = createConnectTransport({
  baseUrl: base,
  useBinaryFormat: true,
  useHttpGet: true,
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
});
export const client = new RPC(transport);

const cookiesInterceptor: Interceptor = (next) => async (req) => {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('flexauth_token')) {
      req.header.set('Authorization', `Bearer ${cookie.value}`);
      continue;
    }
    if (cookie.name.includes('session')) {
      req.header.set('X-Session', `${cookie.value}`);
    }
  }
  return next(req);
};
const authenticatedTransport = createConnectTransport({
  baseUrl: base,
  interceptors: [cookiesInterceptor],
  useBinaryFormat: true,
  useHttpGet: true,
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
});
export const authenticatedClient = new RPC(authenticatedTransport);
