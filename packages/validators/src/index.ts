import { z } from "zod";

export const eventSchema = z.object({
  startDate: z.string().min(1, { message: "Start date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
});

export const formSchema = z.object({
  eventName: z.string().min(3, {
    message: "Event name must be at least 3 characters",
  }),
  category: z.string().min(1, { message: "Category is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  email: z.string().email({ message: "Email is required" }),
  events: z.array(eventSchema).min(1, { message: "Events are required" }),
  details: z
    .string()
    .min(1, { message: "Please provide a description for your event" }),
  facility: z.string().min(1, { message: "Facility is required" }),
  userId: z.string(),
  techSupport: z.boolean(),
  techDetails: z.string(),
  doorAccess: z.boolean(),
  doorsDetails: z.string(),
});
