import React from "react";

import { auth } from "@local/auth";

interface Reservation {
  userId: string;
}

interface Props {
  children: React.ReactNode;
  reservation: Reservation;
}

export default async function IsUserReserv({ children, reservation }: Props) {
  const session = await auth();
  const user = session?.user;
  if (session?.user) {
    if (
      user?.id === reservation.userId ||
      session.user.role.includes("ADMIN")
    ) {
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
  } else {
    return (
      <React.Fragment>
        <div>you must be logged in</div>
      </React.Fragment>
    );
  }
}
