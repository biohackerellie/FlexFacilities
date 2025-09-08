import { auth } from '@/lib/auth';

export async function IsAdmin() {
  const session = await auth();
  if (!session) return false;
  if (session?.userRole === 'ADMIN') {
    return true;
  } else {
    return false;
  }
}
