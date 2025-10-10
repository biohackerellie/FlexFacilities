import { notFound } from 'next/navigation';
import * as React from 'react';
import { client } from '@/lib/rpc';
import ResetForm from './form';

async function VerifyToken(token: string) {
  'use server';
  const { data, error } = await client.auth().verifyResetPassword({ token });
  if (error) {
    return null;
  }
  return data?.email;
}

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const email = await VerifyToken(token);
  if (!email) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <React.Suspense fallback={<h1>Loading...</h1>}>
        <ResetForm email={email} />
      </React.Suspense>
    </div>
  );
}
