import React from 'react';

import { Session } from '@/lib/types';

interface Reservation {
  userId: string;
}

interface Props {
  children: React.ReactNode;
  reservation: Reservation;
  session: Session;
}

export default function IsUserReserv({
  children,
  reservation,
  session,
}: Props) {
  if (session.userId === reservation.userId || session.userRole === 'ADMIN') {
    return <>{children}</>;
  } else {
    return (
      <div className="flex flex-col flex-wrap justify-center text-center align-middle">
        <h1 className="text-2xl font-bold">
          You must be logged in to view this page
        </h1>
      </div>
    );
  }
}
