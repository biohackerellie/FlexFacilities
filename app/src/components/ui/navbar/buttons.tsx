import React from "react";
import Link from "next/link";

export function ReservationButton() {
  return (
    <div className="hover:bg-secondaryDark border-secondaryDark w-[220px] rounded border-b-4 bg-secondary px-4 py-2 text-center font-bold text-white shadow-sm drop-shadow-lg transition ease-in-out hover:scale-110">
      <Link
        href="/reservation"
        className="hover:animate-bounce text-xl font-bold drop-shadow-lg"
      >
        {" "}
        Request a rental{" "}
      </Link>
    </div>
  );
}
