import { z } from "zod"

// Step 1: Personal Information Schema
export const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  age: z
    .string()
    .min(1, "Age is required")
    .refine((val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num >= 18 && num <= 120
    }, "Age must be between 18 and 120"),
})

// Step 2: Contact Information Schema (placeholder)
export const step2Schema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
})

// Step 3: Preferences Schema (placeholder)
export const step3Schema = z.object({
  preferences: z.string().min(10, "Please provide at least 10 characters"),
  newsletter: z.boolean(),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
