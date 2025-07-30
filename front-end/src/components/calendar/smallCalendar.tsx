"use client";

import type { Event } from "react-big-calendar";
import * as React from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import type { GoogleEvents } from "@/lib/types";
import { useTheme } from "next-themes";
import Modal from "react-modal";

import { GetEvents } from "@/functions/events/googleAPI";

const localizer = momentLocalizer(moment);

interface Props {
  promise: ReturnType<typeof GetEvents>;
}

interface MappedEvent extends Event {
  building: string;
}

export default function SmallCalendar({ promise }: Props) {
  const events = React.use(promise);
  const mappedEvents: MappedEvent[] = events.map((event: GoogleEvents) => {
    const facility =
      (event.location ?? "Event-Unknown").split("-")[0] || "Event";
    return {
      title: event?.title || "Event",
      start: new Date(event?.start as unknown as string),
      end: new Date(event?.end as unknown as string),
      building: facility,
    };
  });

  const { theme } = useTheme();

  const isDarkMode = theme === "dark";
  const calendarStyle = {
    height: 450,
    width: 500,
    border: 2,
    ...(isDarkMode && {
      WebkitTextFillColor: "white",
      WebkitTextStrokeColor: "white",
    }),
  };

  const [selectedEvent, setSelectedEvent] = React.useState<MappedEvent | null>(
    null,
  );
  const views = {
    month: true,
    week: false,
    day: false,
    agenda: false,
  };

  React.useEffect(() => {
    if (selectedEvent) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [selectedEvent]);

  return (
    <>
      <div className="h-35 max-h-35 float-left mb-10 mr-10 max-w-[550px] p-3">
        <Calendar
          views={views}
          localizer={localizer}
          events={mappedEvents}
          onSelectEvent={(event: MappedEvent) => setSelectedEvent(event)}
          popup
          startAccessor="start"
          endAccessor="end"
          style={calendarStyle}
        />
      </div>
      <div className="items-center justify-center align-middle drop-shadow-md">
        <Modal
          isOpen={!!selectedEvent}
          onRequestClose={() => setSelectedEvent(null)}
          className="fixed inset-0 z-50 flex items-center justify-center text-black transition-opacity duration-500 ease-out dark:text-black"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 modal-overlay"
        >
          <div className="rounded-lg bg-white p-8">
            <h3 className="mb-4 text-xl font-bold">{selectedEvent?.title}</h3>
            <h4 className="mb-2 text-lg">{selectedEvent?.building}</h4>

            <p className="mb-2">
              {" "}
              Starts at {selectedEvent?.start?.toLocaleString()}
            </p>
            <p className="mb-4">
              {" "}
              Ends at {selectedEvent?.end?.toLocaleString()}
            </p>
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
