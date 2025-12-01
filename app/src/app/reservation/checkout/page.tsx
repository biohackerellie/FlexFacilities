import * as React from 'react';
import CheckoutForm from '@/components/forms/showPayment';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const reservationId = (await searchParams).reservationId;

  const { session, token } = await getCookies();

  if (!session || !token || !reservationId) {
    return <div>Must be logged in</div>;
  }

  const authed = client.withAuth(session, token);
  const { data: clientSecret, error: clientSecretError } = await authed
    .payments()
    .createPaymentIntent({ reservationId: reservationId });
  const { data: publicKey, error: publicKeyError } = await authed
    .payments()
    .getStripePublicKey({});
  if (clientSecretError || publicKeyError) {
    return (
      <div>Error: {clientSecretError?.message || publicKeyError?.message}</div>
    );
  }
  if (!clientSecret || !publicKey) {
    return <div>Loading...</div>;
  }
  return (
    <div className='container-wrapper'>
      <div className='container'>
        <React.Suspense fallback={<div>Loading...</div>}>
          <CheckoutForm
            clientSecret={clientSecret?.clientSecret}
            publicKey={publicKey?.publicKey}
          />
        </React.Suspense>
      </div>
    </div>
  );
}
