import { cacheTag } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { UploadFile } from '@/components/forms/uploadFile';
import { Button } from '@/components/ui/button';
import { getBranding } from '@/lib/actions/utility';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';

async function getReservation(id: string, session: string, token: string) {
  'use cache: private';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed
    .reservations()
    .getReservation({ id: id });
  if (error) {
    logger.error('Error fetching reservation', { 'error ': error });
    return null;
  }

  cacheTag(`reservation-${id}`, 'max');
  cacheTag('reservations', 'max');

  return data;
}

export default async function insurancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branding = await getBranding();
  const { session, token } = await getCookies();
  if (!session || !token) {
    return notFound();
  }
  const reservation = await getReservation(id, session, token);
  if (!reservation) return notFound();
  const link = reservation.reservation?.insuranceLink;
  return (
    <div className='space-y-7'>
      <div className=' '>
        <h2 className='text-2xl text-muted-foreground'>Insurance</h2>
        <div className='mx-2 my-5 w-auto justify-between gap-36'>
          <div className='my-2 flex flex-wrap justify-between border-b-2 border-b-gray-700 p-2 text-justify text-xl dark:border-b-white'></div>
          <div className='p-2'>
            <h2 className='my-3 mb-6 flex text-2xl font-bold text-gray-600 dark:text-gray-300'>
              Proof of insurance
            </h2>
            <div className='m-3 flex flex-wrap bg-gray-300 p-5 dark:bg-gray-500'>
              <h3 className='m-2 mb-5 border-b-2'>
                You may upload your certificate of liability insurance here.{' '}
                <b className='underline decoration-red-500 decoration-8'>
                  Note:{' '}
                </b>{' '}
                <React.Suspense fallback={<h1>Loading...</h1>}>
                  Your policy must name{' '}
                  <strong>{branding?.organizationName}</strong> as an additional
                  insured.{' '}
                </React.Suspense>
              </h3>
              <div className='w-full'>
                <React.Activity mode={link ? 'visible' : 'hidden'}>
                  <div className='flex flex-row justify-between'>
                    <Button variant='outline' asChild>
                      <Link href={`/api/files/${link ?? ''}`}>
                        View Uploaded File
                      </Link>
                    </Button>
                  </div>
                </React.Activity>
              </div>
              <div className='my-3'>
                <React.Suspense fallback={<h1>Loading...</h1>}>
                  <UploadFile id={id} />
                </React.Suspense>
                Feature currently unavailable, please send insurance to the
                school district
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
