'use client';
import * as React from 'react';
import type { Facility, Reservation, ReservationDate, User } from '@/lib/types';

interface ReservationContext {
  reservation: Reservation;
  user: User;
  facility: Facility;
  dates: ReservationDate[];
}

export const ReservationContext = React.createContext<
  ReservationContext | undefined
>(undefined);

interface ProviderProps {
  children: React.ReactNode;
  reservation: ReservationContext;
}

export const ReservationProvider = ({
  children,
  reservation,
}: ProviderProps) => {
  return (
    <ReservationContext.Provider value={reservation}>
      {children}
    </ReservationContext.Provider>
  );
};
