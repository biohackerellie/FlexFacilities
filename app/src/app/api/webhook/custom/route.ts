import { calendarIDs } from '@local/validators/constants';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import moment from 'moment-timezone';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { api } from '@/trpc/server';

export function GET(_req: NextRequest) {
  return NextResponse.error();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body) {
    return NextResponse.json({
      ok: false,
      status: 400,
      message: 'Bad Request',
    });
  }
  const bodyKey = body.key;
  if (bodyKey !== process.env.EMAIL_API_KEY) {
    return NextResponse.json({
      ok: false,
      status: 401,
      message: 'Unauthorized',
    });
  }

  const oauth2Client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const currentDate = moment().tz('America/Denver').startOf('day').toDate();
  const sevenDaysFromNow = moment()
    .tz('America/Denver')
    .startOf('day')
    .add(7, 'days')
    .toDate();

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const EmailUsers = await api.user.GetAllEmailPrefs();

  for (const school of calendarIDs) {
    const events = await calendar.events.list({
      calendarId: school?.calendar,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: currentDate.toISOString(),
      timeMax: sevenDaysFromNow.toISOString(),
    });
    if (events.data.items) {
      const eventsInMST = events.data.items.map((event) => {
        return {
          ...event,
          start: moment(event.start?.dateTime || event.start?.date)
            .tz('America/Denver')
            .format('dddd, MMMM Do, h:mm a'),
          end: moment(event.end?.dateTime || event.end?.date)
            .tz('America/Denver')
            .format('h:mm a'),
          location: event.location || 'No Location Provided',
        };
      });

      const eventList = eventsInMST
        .map(
          (event) =>
            `<li>"${event.summary}" at ${event.location} on ${event.start} to ${event.end}</li>`,
        )
        .join('');

      const filtered = EmailUsers.filter((user) => {
        switch (school.school) {
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
        continue;
      }
      try {
        console.log(filtered);
        console.log(school);
        await fetch(`${process.env.NEXT_PUBLIC_EMAIL_API}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.EMAIL_API_KEY!,
          },
          body: JSON.stringify({
            to: filtered,
            from: 'Weekly Events',
            subject: 'Weekly Events',
            html: `<h1>Here are the events happening at ${school.school} this week: </h1><ul>${eventList}</ul>`,
          }),
        });
      } catch (error) {
        return NextResponse.json({
          ok: false,
          status: 500,
          message: 'Internal Server Error',
        });
      }
    }
  }
  return NextResponse.json({
    ok: true,
    status: 200,
    message: 'Success',
  });
}
