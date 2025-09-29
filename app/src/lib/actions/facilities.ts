'use server';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { IEvent } from '@/calendar/interfaces';
import { TEventColor } from '@/calendar/types';
import { client } from '@/lib/rpc';
import { logger } from '../logger';
import { Building } from '../types';

export async function getFacility(id: string) {
  'use cache';
  const { data: facility, error } = await client
    .facilities()
    .getFacility({ id: BigInt(id) });

  cacheTag('facilities', id);

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  return facility;
}

export async function getEventsByFacility(id: string) {
  'use cache';
  const { data: events, error } = await client
    .facilities()
    .getEventsByFacility({ id: BigInt(id) });
  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  cacheTag('events', id);
  return events;
}

export async function getAllEvents() {
  'use cache';
  const { data, error } = await client.facilities().getAllEvents({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  cacheTag('events');
  return data;
}

export async function getFacilities() {
  'use cache';
  const { data, error } = await client.facilities().getAllFacilities({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }

  return data;
}

export async function getAllBuildingNames() {
  'use cache';
  const { data, error } = await client.facilities().getAllBuildings({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
  }
  if (!data) {
    return null;
  }
  cacheTag('facilities');
  return data.buildings.map((b) => {
    return { name: b.name, id: b.id };
  });
}

type ReturnType = {
  events: IEvent[];
  buildings: Building[];
};
export async function getAllCalEvents(): Promise<ReturnType | null> {
  'use cache';
  const { data, error } = await client.facilities().getAllEvents({});
  if (error) {
    logger.error('error fetching events', { error: error.message });
    return null;
  }
  if (!data) return null;
  const result: ReturnType = {
    events: [],
    buildings: [],
  };
  const possibleColors: TEventColor[] = [
    'red',
    'yellow',
    'green',
    'blue',
    'purple',
    'orange',
    'gray',
  ];
  let color = possibleColors[0];
  data.data.forEach((event, i) => {
    const events = event.events.map((e, x) => {
      return {
        id: x,
        startDate: e.start,
        endDate: e.end,
        title: e.title,
        color: color,
        description: e.description,
        building: event.building,
        location: e.location,
      } as IEvent;
    });
    result.events.push(...events);
    result.buildings.push(event.building!);

    color = possibleColors[i + 1];
    if (color === undefined) {
      color = possibleColors[0];
    }
  });
  cacheTag('events');
  return result;
}
