'use client';
import * as React from 'react';
import type {
  Facility,
  Reservation,
  ReservationDate,
  Session,
  User,
} from '@/lib/types';

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

interface AuthContext {
  session: Session | null;
}

export const AuthContext = React.createContext<AuthContext | undefined>(
  undefined,
);

export const AuthProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};

interface UserContext {
  user: User;
}

export const UserContext = React.createContext<UserContext | undefined>(
  undefined,
);

export const UserProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) => {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

interface FacilityContext {
  facility: Facility;
}
