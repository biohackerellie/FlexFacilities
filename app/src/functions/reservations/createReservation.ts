'use server';

/**
 * Serverless function for creating a new reservation from form data
 */
import type { z } from 'zod';
import { revalidateTag } from 'next/cache';

import { formSchema } from '@/lib/validators';
import type { Reservation } from '@/lib/types';

import { newReservationEmail } from '../emails/reservationEmail';

// Validate form data values against the form schema
type formValues = z.infer<typeof formSchema>;
type NewReservation = Reservation;
export default async function submitReservation(data: formValues) {
  try {
    // Helper database function to find a category by facility and category name
    const categoryId = await api.category.byFacility({
      facilityId: parseInt(data.facility),
      name: `%${data.category}%`,
    });

    // Helper database function to find a facility by id
    const Facility = await api.facility.byId({ id: parseInt(data.facility) });
    // Helper database function to find a building by id
    const Building = Facility?.building!;

    // Create a new reservation object with strict typing from the database schema
    const NReservation: NewReservation = {
      userId: data.userId,
      eventName: data.eventName,
      facilityId: parseInt(data.facility),
      details: data.details,
      insurance: false,
      categoryId: Number(categoryId?.id) || 0,
      name: data.name,
      phone: data.phone,
      techSupport: data.techSupport,
      techDetails: data.techDetails,
      doorAccess: data.doorAccess,
      doorsDetails: data.doorsDetails,
    };

    // Create the new reservation in the database and return the id
    const NewId = await api.reservation.createReservation(NReservation);

    // Extract the id from the returned object
    const reservationId = NewId?.id!;

    // Create new empy arrays for the events and reservation dates table inserts

    const reservationDatesToInsert = [];

    // Loop through each event in the form data and create a new event and reservation date object and add them to the arrays
    for (const event of data.events) {
      reservationDatesToInsert.push({
        startDate: event.startDate,
        endDate: event.startDate,
        startTime: event.startTime,
        endTime: event.endTime,
        reservationId: reservationId,
      });
    }

    // Insert the events and reservation dates into the database
    await api.reservation.createReservationDates(reservationDatesToInsert);
    // Send an email to building admins, prevents action while testing
    if (process.env.NODE_ENV === 'production') {
      newReservationEmail({
        building: Building,
        name: data.name,
        eventName: data.eventName,
        reservationId: Number(reservationId),
      });
    }

    // Revalidate the admin page to update the cache
    revalidateTag('reservations');
    return 'Success';
  } catch (error) {
    throw new Error('Error creating reservation');
  }
}
