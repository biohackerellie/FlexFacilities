"use server";

import { api } from "@/trpc/server";

export default async function updateEmail(id: number) {
  const reservation = await api.reservation.byId({ id: id });

  await fetch(`https://api.laurel.k12.mt.us/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EMAIL_API_KEY!,
    },
    body: JSON.stringify({
      to: reservation?.User.email!,
      from: "Laurel Facility Rental",
      subject: "Laurel Facility Reservation Update",
      html: `<h1> Your reservation for ${reservation?.Facility.name} has been updated. </h1> <p> Please visit https://laurel.k12.mt.us/reservation/${reservation?.id} to view the update. \n\n If you have any questions, please contact the Activities Director at lpsactivities@laurel.k12.mt.us </p>`,
    }),
  });
}
