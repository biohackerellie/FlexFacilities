// form-schemas.ts
import { z } from 'zod';

const Occurrence = z.object({
  start: z.string(),
  end: z.string(),
});

const days = z.literal(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']);
const RecurrencePattern = z.object({
  freq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  byWeekday: z.array(days).optional(),
  until: z.string().optional(),
  count: z.number().optional(),
});
export const step1Schema = z.object({
  userID: z.string().min(2, 'You must be logged in to create a reservation'),
  facilityID: z.string().min(1, 'You must select a facility'),

  priceID: z.string().min(1, 'You must select a pricing category'),
});

export const step2Schema = z.object({
  eventName: z.string().min(2, 'Event name must be at least 2 characters'),
  details: z.string().min(10, 'Please provide at least 10 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export const step3Schema = z.object({
  startDate: z.iso.date('Start date is required').optional(),
  startTime: z.iso.time('Start time is required').optional(),
  endDate: z.iso.date('End date is required').optional(),
  endTime: z.iso.time('End time is required').optional(),
  pattern: RecurrencePattern.optional(),
  occurrences: z.array(Occurrence).optional(),
});

export const step4Schema = z.object({
  techSupport: z.boolean(),
  techDetails: z.string().optional(),
  doorAccess: z.boolean(),
  doorDetails: z.string().optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;

export type RecurrencePatternType = z.infer<typeof RecurrencePattern>;
export type OccurrenceType = z.infer<typeof Occurrence>;
