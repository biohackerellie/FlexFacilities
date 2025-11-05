export function setAuthHeaders(
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
