export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  return await fetch(`${process.env.NEXT_PUBLIC_EMAIL_API}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EMAIL_API_KEY!,
    },
    body: JSON.stringify({
      to: to,
      from: 'Laurel Public Schools',
      subject: subject,
      text: text,
    }),
  });
}
