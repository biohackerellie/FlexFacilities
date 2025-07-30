import type { FacilityType, ReservationDateType } from "@local/db/schema";

export const generateMockFacility = (
  overrides?: Partial<FacilityType>,
): FacilityType => {
  return {
    id: 1,
    name: "Board Room",
    createdAt: new Date().toISOString(),
    building: "Main Building",
    address: "123 Main St",
    imagePath: null,
    capacity: 50,
    updatedAt: new Date().toISOString(),
    googleCalendarId: "calendar-id",
    ...overrides,
  };
};

function randomDate() {
  return new Date(+new Date() - Math.floor(Math.random() * 10000000000));
}

export const generateMockReservationDate = (
  overrides?: Partial<ReservationDateType>,
): ReservationDateType => {
  return {
    id: 1,
    reservationId: 1,
    startDate: randomDate().toISOString(),
    endDate: randomDate().toISOString(),
    approved: "approved",
    startTime: "08:00",
    endTime: "10:00",
    gcal_eventid: "gcal-event-id",

    ...overrides,
  };
};
