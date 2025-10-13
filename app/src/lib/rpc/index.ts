import { createConnectTransport } from '@connectrpc/connect-web';
import { Interceptor } from '@connectrpc/connect';
import { cookies } from 'next/headers';
import { RPC } from './rpc';

const cookiesInterceptor: Interceptor = (next) => async (req) => {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('flexauth_token')) {
      req.header.set('Authorization', `Bearer ${cookie.value}`);
      continue;
    }
    if (cookie.name.includes('flexauth_session')) {
      req.header.set('Session', `${cookie.value}`);
      continue;
    }
  }
  return next(req);
};
const base = new URL(process.env.API_HOST ?? 'http://localhost');
base.port = String(process.env.API_PORT ?? 8080);

const transport = createConnectTransport({
  baseUrl: base.toString(),
  interceptors: [cookiesInterceptor],
});
export const client = new RPC(transport);
