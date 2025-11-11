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

export const TokenCookie = 'flexauth_token';

export const SessionCookie = 'flexauth_session';

export async function getCookies() {
  const cookieStore = await cookies();
  const tokenName = TokenCookie;
  const sessionName = SessionCookie;

  const token = cookieStore.get(tokenName)?.value;
  const session = cookieStore.get(sessionName)?.value;
  return { session, token };
}
