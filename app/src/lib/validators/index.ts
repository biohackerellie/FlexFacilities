import { z } from 'zod';

export const eventSchema = z.object({
  startDate: z.iso.date('Start date is required'),
  startTime: z.iso.time('Start time is required'),
  endTime: z.iso.time('End time is required'),
});

export const formSchema = z.object({
  eventName: z.string().min(3, {
    error: 'Event name must be at least 3 characters',
  }),
  category: z.string().min(1, { error: 'Category is required' }),
  name: z.string().min(1, { error: 'Name is required' }),
  phone: z.string().min(1, { error: 'Phone number is required' }),
  email: z.email({ error: 'Email is required' }),
  events: z.array(eventSchema).min(1, { error: 'Events are required' }),
  details: z
    .string()
    .min(1, { error: 'Please provide a description for your event' }),
  facility: z.string().min(1, { error: 'Facility is required' }),
  userId: z.string(),
  techSupport: z.boolean(),
  techDetails: z.string(),
  doorAccess: z.boolean(),
  doorsDetails: z.string(),
});
