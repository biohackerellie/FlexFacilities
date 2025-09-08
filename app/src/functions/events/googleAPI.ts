'use server';

import type { GoogleEvents } from '@/lib/types';
import { cache } from 'react';

import { env } from '@/env';
import { getClient } from '@/lib/oauth';
import { api } from '@/trpc/server';

async function GEvents(id: number) {
  const res = await api.facility.byId({ id: id });

  const calID = res?.googleCalendarId;

  const oauth2Client = getClient();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const response = await calendar.events.list({
      calendarId: calID,
      maxResults: 1000,
      singleEvents: true,

      orderBy: 'startTime',
    });
    let events: GoogleEvents[] = [];
    if (response.data.items) {
      events = response.data.items.map((e) => {
        const start = e.start?.dateTime || e.start?.date;
        const end = e.end?.dateTime || e.end?.date;
        return {
          gLink: e.htmlLink,
          description: e.description,
          location: e.location,
          start,
          end,
          title: e.summary,
          meta: e,
        };
      });
    }
    return events;
  } catch (error) {
    throw new Error('Error getting events');
  }
}

async function AllEvents() {
  const oauth2Client = getClient();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const response = await calendar.events.list({
      calendarId:
        'c_a55b94eb4dd05e5dd936dd548d434d6a25c2694efe67224e3eff10205d2fb82b@group.calendar.google.com',
      maxResults: 1000,
      singleEvents: true,
      orderBy: 'startTime',
    });
    let events: GoogleEvents[] = [];
    if (response.data.items) {
      events = response.data.items.map((e) => {
        const start = e.start?.dateTime || e.start?.date;
        const end = e.end?.dateTime || e.end?.date;
        return {
          gLink: e.htmlLink,
          description: e.description,
          location: e.location,
          start,
          end,
          title: e.summary,
          meta: e,
        };
      });
    }
    return events;
  } catch (error) {
    console.log(error);
    throw new Error('Error getting events');
  }
}
