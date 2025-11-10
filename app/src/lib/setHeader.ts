import { cookies } from 'next/headers';

export function getAuthHeaders(
  session: string | undefined,
  token: string | undefined,
) {
  const headers = new Headers();
  if (session) {
    headers.set('X-Session', session);
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function getCookies() {
  const cookieStore = await cookies();
  const tokenName =
    process.env.NODE_ENV === 'production'
      ? 'Secure__flexauth_token'
      : 'flexauth_token';
  const sessionName =
    process.env.NODE_ENV === 'production'
      ? 'Secure__flexauth_session'
      : 'Secure__flexauth_session';
  const token = cookieStore.get(tokenName)?.value;
  const session = cookieStore.get(sessionName)?.value;
  return { session, token };
}
