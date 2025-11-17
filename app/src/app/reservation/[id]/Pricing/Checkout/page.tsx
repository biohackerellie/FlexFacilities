import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, token } = await getCookies();

  if (!session || !token) {
    return <div>Must be logged in</div>;
  }

  const { data, error } = await client.withAuth(session, token).payments().createPayment({ reservationId: id });
  return (

  )
}
