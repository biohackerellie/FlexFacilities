import { db } from '@local/db/client';
import { Reservation } from '@local/db/schema';
import { put } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  if (!request.body) {
    return NextResponse.json({ error: 'No File Provided' }, { status: 400 });
  }
  console.log('request', request);
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || 'file';

  const blob = await put(filename, request.body, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  try {
    await db
      .update(Reservation)
      .set({ insuranceLink: blob.url })
      .where(eq(Reservation.id, Number(searchParams.get('id'))));
  } catch (error) {
    throw new Error('Error uploading file', { cause: error });
  }
  revalidateTag('reservations');
  return NextResponse.json({ 'File uploaded': true }, { status: 200 });
}
