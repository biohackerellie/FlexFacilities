'use server';
import { IEvent } from '@/calendar/interfaces';
import { TEventColor } from '@/calendar/types';
import { client } from '@/lib/rpc';
import { logger } from '../logger';
import { Building } from '../types';

export async function getFacility(id: string) {
  const { data: facility, error } = await client
    .facilities()
    .getFacility({ id: id });

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  return facility;
}

export async function getEventsByFacility(id: string) {
  const { data: events, error } = await client
    .facilities()
    .getEventsByFacility({ id: id });
  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  return events;
}

export async function getAllEvents() {
  const { data, error } = await client.facilities().getAllEvents({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }
  return data;
}

export async function getFacilities() {
  const { data, error } = await client.facilities().getAllFacilities({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
    return null;
  }

  return data;
}

export async function getAllBuildingNames() {
  const { data, error } = await client.facilities().getAllBuildings({});

  if (error) {
    logger.error('Error fetching facilities', { 'error ': error });
  }
  if (!data) {
    return null;
  }
  return data.buildings.map((b) => {
    return { name: b.name, id: b.id };
  });
}

type ReturnType = {
  events: IEvent[];
  buildings: Building[];
};
export async function getAllCalEvents(): Promise<ReturnType | null> {
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
  return result;
}
type LatLngTuple = [number, number, number?];
interface ICoords {
  latlng: LatLngTuple;
  building: string;
}
interface mapCoords {
  coords: ICoords[];
  center: LatLngTuple;
}
export async function getAllMapCoords(): Promise<mapCoords | null> {
  const { data, error } = await client.facilities().getAllCoords({});
  if (error) {
    logger.error('error fetching events', { error: error.message });
    return null;
  }
  if (!data) return null;
  const coords = data.data.map((d) => {
    return {
      latlng: [d.latitude, d.longitude],
      building: d.building,
    } as ICoords;
  });

  const center = calculateCenter(coords);
  return { coords, center };
}

function calculateCenter(coords: ICoords[]): LatLngTuple {
  if (coords.length < 2) {
    return [coords[0]?.latlng[0] ?? 0, coords[0]?.latlng[1] ?? 0];
  }
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  let x = 0,
    y = 0,
    z = 0;

  for (const { latlng } of coords) {
    const lat = toRadians(latlng[0]);
    const lng = toRadians(latlng[1]);
    x += Math.cos(lat) * Math.cos(lng);
    y += Math.cos(lat) * Math.sin(lng);
    z += Math.sin(lat);
  }

  const total = coords.length;
  x /= total;
  y /= total;
  z /= total;

  const lng = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);

  return [toDegrees(lat), toDegrees(lng)];
}
