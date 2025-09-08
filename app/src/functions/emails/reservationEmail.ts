'use server';

import { api } from '@/trpc/server';

interface emailData {
  to: string;
  message: string;
  subject: string;
}
/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export default async function reservationEmail(data: emailData) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_EMAIL_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EMAIL_API_KEY!,
      },
      body: JSON.stringify({
        to: data.to,
        from: 'Laurel Facility Rental',
        subject: data.subject,
        html: `${data.message}`,
      }),
    });
    return Response.json({ ok: true, status: 200 });
  } catch (error) {
    return Response.json({ ok: false, status: 500, body: error });
  }
}

interface data {
  name: string;
  eventName: string;
  reservationId: number | bigint;
  building?: string;
}
/**
 * @deprecated
 *  TODO: rewrite this in golang
 */

export async function newReservationEmail(data: data) {
  const EmailUsers = await api.user.GetEmailsForAdminUsers();

  const filtered = EmailUsers.filter((user) => {
    switch (data.building) {
      case 'Laurel Stadium':
        return user.StEmails === true;
      case 'West Elementary':
        return user.WeEmails === true;
      case 'South Elementary':
        return user.SoEmails === true;
      case 'Graff Elementary':
        return user.GrEmails === true;
      case 'Laurel High School':
        return user.HsEmails === true;
      case 'Laurel Middle School':
        return user.MsEmails === true;
      case 'Administration Building':
        return user.AdminEmails === true;
    }
  })
    .map((user) => user.email)
    .join(', ');
  if (filtered === '') {
    return;
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_EMAIL_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EMAIL_API_KEY!,
      },
      body: JSON.stringify({
        to: filtered,
        from: 'Facility Rental',
        subject: 'New Facility Reservation',
        html: `<h1> New Facility Reservation </h1> <p>A new reservation request has been submitted by ${data.name} for ${data.eventName}. You can view the reservation here: https://facilities.laurel.k12.mt.us/reservation/${data.reservationId}</p>`,
      }),
    });
  } catch (error) {
    throw new Error('Error sending email');
  }
}
