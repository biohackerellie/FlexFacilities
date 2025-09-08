import * as React from 'react';
import type { FullReservation, User, Category } from '@/lib/types';

export interface ReservationContext {
  reservation: FullReservation;
  user: User;
  category: Category;
}
export const ReservationContext =
  React.createContext<ReservationContext | null>(null);

export function ReservationProvider({
  children,
  reservation,
  user,
  category,
}: {
  children: React.ReactNode;
  reservation: FullReservation;
  user: User;
  category: Category;
}) {
  return (
    <ReservationContext.Provider value={{ reservation, user, category }}>
      {children}
    </ReservationContext.Provider>
  );
}
