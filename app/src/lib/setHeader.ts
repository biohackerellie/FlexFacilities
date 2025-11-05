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
  let session = '';
  let token = '';
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('flexauth_token')) {
      token = cookie.value;
      continue;
    }
    if (cookie.name.includes('session')) {
      session = cookie.value;
    }
  }
  return { session, token };
}
