"use client";

import React from "react";

import type { FacilityType as Facility } from "@local/db/schema";

import { JiraModal } from "@/components/forms";
import { Separator } from "@/components/ui/separator";
import ReservationOptions from "@/components/ui/tables/reservations/reservation/options";

interface AdminPanelProps {
  id: number | bigint;
  facility: Facility | undefined;
}

export default function AdminPanel({ id, facility }: AdminPanelProps) {
  return (
    <div className="text-md flex h-5 items-center space-x-4">
      <Separator orientation="vertical" />
      <div>
        <ReservationOptions id={id} facility={facility} />
      </div>
      <Separator orientation="vertical" />
      <div>
        <JiraModal />
      </div>
    </div>
  );
}
