import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  await auth();
  updateTag('session');
  return redirect('/login');
}
