'use server';

import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import moment from 'moment-timezone';

import { api } from '@/trpc/server';
import generateId from '../calculations/generate-id';

/**
 * @deprecated
 *  TODO: rewrite this in golang
 */
export default async function CreateGoogleEvents(id: number) {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const oauth2Client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const approvedReservation = await api.reservation.byId({ id: id });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  //@ts-expect-error - googleCalendarId is not undefined
  for (const reservationDate of approvedReservation.ReservationDate) {
    const startDateTime = moment
      .tz(
        `${reservationDate.startDate} ${reservationDate.startTime}`,
        'America/Denver',
      )
      .toISOString();

    const endDateTime = moment
      .tz(
        `${reservationDate.endDate} ${reservationDate.endTime}`,
        'America/Denver',
      )
      .toISOString();

    const event = {
      summary: approvedReservation?.eventName,

      description: approvedReservation?.details,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Denver',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Denver',
      },
    };
    try {
      const response = await calendar.events.insert({
        calendarId: approvedReservation?.Facility.googleCalendarId!,
        requestBody: event,
      });
    } catch (error) {
      console.error('Failed to create event: ', error);

      return NextResponse.json({ response: 500, message: error });
    }
  }
  return NextResponse.json({
    response: 200,
    message: 'google cal event created',
  });
}
