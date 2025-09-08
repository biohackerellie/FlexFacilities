import { notFound } from 'next/navigation';

import { client } from '@/lib/rpc';

async function getReservation(id: bigint) {
  const { data, error } = await client.reservation().getReservation({ id });
  if (error || !data) return null;

  return data;
}

export default async function reservationPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getReservation(BigInt(params.id));
  if (!data) return notFound();
  const { name, primaryContact, phone, details } = data.reservation!;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl text-muted-foreground"> Summary </h2>
      </div>
      <div className="hidden flex-col flex-wrap justify-between sm:flex">
        <div className="flex flex-row justify-between border-b-2 text-justify text-lg">
          Primary Contact: {primaryContact} <div> {name}</div>
        </div>
        <div className="flex flex-row justify-between border-b-2 text-justify text-lg">
          Contact Number: <div>{phone}</div>
        </div>
        <div className="flex flex-row justify-between border-b-2 text-justify text-lg">
          Contact Email: <div>{reservation.User.email}</div>
        </div>
        <div className="flex flex-row border-b-2 text-justify text-lg sm:justify-between">
          Requested Category:{' '}
          <div className="text max-w-sm truncate text-ellipsis">
            {Category.name}
          </div>
        </div>
        <div className="my-10 flex flex-row flex-wrap justify-between gap-10 text-ellipsis border-b-2 text-justify text-xl">
          Description:{' '}
          <div className="text-md ml-10 flex text-ellipsis text-left">
            {details}{' '}
          </div>
        </div>
      </div>
    </div>
  );
}
