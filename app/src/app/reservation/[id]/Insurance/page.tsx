import Link from 'next/link';
import { notFound } from 'next/navigation';

import { UploadFile } from '@/components/forms/uploadFile';
import { Button } from '@/components/ui/buttons';
import { api } from '@/trpc/server';

export default async function insurancePage({
  params,
}: {
  params: { id: string };
}) {
  const reservation = await api.reservation.byId({
    id: parseInt(params.id, 10),
  });
  if (!reservation) return notFound();
  let link = undefined;
  if (reservation.insuranceLink) {
    link = reservation.insuranceLink;
  }
  return (
    <div className="space-y-7">
      <div className=" ">
        <h2 className="text-2xl text-muted-foreground">Insurance</h2>
        <div className="mx-2 my-5 w-auto justify-between gap-36">
          <div className="my-2 flex flex-wrap justify-between border-b-2 border-b-gray-700 p-2 text-justify text-xl dark:border-b-white">
            <p>
              Upon approval, your event(s) will be shown in the chart below
              along with any requirement for insurance coverage. If you do not
              provide the required coverage for the event by the listed deadline
              (7 days prior to the event), your event might be canceled. If your
              event requires coverage, your event is subject to the following
              policy:
            </p>

            <div className="m-2 bg-gray-300 p-5 text-sm dark:bg-gray-500">
              <p>
                The user of the facility shall provide the District with a
                certificate of insurance and endorsement to their property and
                liability policy. Said certificate and policy endorsement shall
                name the District as an additional insured. The certificate and
                policy shall show coverage for comprehensive general liability
                insurance for injuries to or death of any person or damage to or
                loss of property arising out of or in any way resulting from the
                described use of the facility. The insurance shall provide for
                amounts not less than $1,000,000 for bodily injury or death to
                any one person or resulting from any one accident, and
                $1,000,000 for property damage in any one accident or the policy
                may provide a combined single limit for bodily injury and
                property damage for $1,000,000. The certificate shall contain a
                provision that the insurer not cancel or refuse to renew without
                giving the District written notice at least 10 days before the
                effective date of the cancellation or non-renewal.
              </p>
            </div>
          </div>
          <div className="p-2">
            <h2 className="my-3 mb-6 flex text-2xl font-bold text-gray-600 dark:text-gray-300">
              Proof of insurance
            </h2>
            <div className="m-3 flex flex-wrap bg-gray-300 p-5 dark:bg-gray-500">
              <h3 className="m-2 mb-5 border-b-2">
                You may upload your certificate of liability insurance here.{' '}
                <b className="underline decoration-red-500 decoration-8">
                  Note:{' '}
                </b>{' '}
                Your policy must name <strong> Laurel Public Schools </strong>{' '}
                as an additional insured.{' '}
              </h3>
              <div className="w-full">
                {link && (
                  <div className="flex flex-row justify-between">
                    <Button variant="outline" asChild>
                      <Link href={link}>View Uploaded File</Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="my-3">
                <UploadFile params={params} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
