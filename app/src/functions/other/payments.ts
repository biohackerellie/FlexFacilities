'use server';

import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { Client, Environment } from 'square';

import { db } from '@local/db/client';
import { Reservation } from '@local/db/schema';

import { env } from '@/env';
import generateId from '@/functions/calculations/generate-id';

const { checkoutApi } = new Client({
  accessToken: env.SQUARE_TOKEN,
  environment: Environment.Production,
});

type PaymentProps = {
  id: number;
  fees: number;
  description: string;
  email: string;
};

/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export async function GeneratePaymentLink(
  id: number,
  fees: number,
  description: string,
  email: string,
) {
  const uuid = generateId();
  try {
    const res = await checkoutApi.createPaymentLink({
      idempotencyKey: uuid,
      description: 'Facility Rental',
      quickPay: {
        name: description,
        priceMoney: {
          amount: BigInt(Math.round(fees * 100)),
          currency: 'USD',
        },
        locationId: env.SQUARE_LOCATION_ID,
      },
      checkoutOptions: {
        allowTipping: false,
        askForShippingAddress: false,
        enableCoupon: false,
        enableLoyalty: false,
      },
      prePopulatedData: {},
      paymentNote: description,
    });

    const paymentUrl = res.result.paymentLink?.url;
    const paymentId = res.result.paymentLink?.id;

    await db
      .update(Reservation)
      .set({
        paymentLinkID: paymentId,
        paymentUrl: paymentUrl,
      })
      .where(eq(Reservation.id, id));

    try {
      await fetch(`${env.NEXT_PUBLIC_EMAIL_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EMAIL_API_KEY!,
        },
        body: JSON.stringify({
          to: email,
          from: 'Facility Rental',
          subject: 'Facility Rental Payment Link',
          html:
            'Click the link below to pay for your reservation: \n \n ' +
            paymentUrl +
            '\n \n If you have any questions, please contact the Activities Director at lpsactivites@laurel.k12.mt.us',
        }),
      });
    } catch (error) {
      throw new Error('Email failed to send');
    }
  } catch (error) {
    throw new Error('Payment Link Failed to Create');
  }
  revalidateTag('reservations');
}
