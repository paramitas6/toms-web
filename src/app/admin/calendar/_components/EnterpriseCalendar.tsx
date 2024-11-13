// components/EnterpriseCalendar.tsx
"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventApi, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { getOrdersInRange } from "@/app/api/calendar/route";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const EnterpriseCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const router = useRouter();

  const handleDatesSet = async (arg: { start: Date; end: Date }) => {
    const startDate = dayjs(arg.start).toDate();
    const endDate = dayjs(arg.end).toDate();

    try {
      const orders = await getOrdersInRange(startDate, endDate);
      setEvents(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleEventClick = (clickInfo: { event: EventApi }) => {
    // Navigate to order details page
    router.push(`/admin/orders/${clickInfo.event.id}`);
  };

  const eventContent = (eventInfo: { event: EventApi }) => {
    let bgColor = "";

    switch (eventInfo.event.extendedProps.status) {
      case "payment pending":
        bgColor = "bg-red-200 text-red-800";
        break;
      case "in progress":
        bgColor = "bg-yellow-200 text-yellow-800";
        break;
      case "ready to be picked up":
        bgColor = "bg-blue-200 text text-blue-800";
        break;
      case "picked up":
        bgColor = "bg-green-200 text text-green-800";
        break;
      case "CANCELLED":
        bgColor = "bg-red-500 text-white";
        break;
      default:
        bgColor = "bg-blue-500 text-white";
    }

    return (
      <div
        className={`p-2 rounded ${bgColor}  whitespace-normal break-words`}
        style={{ minHeight: "auto" }} // Ensures cell can grow in height
      >
        {eventInfo.event.title}
      </div>
    );
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="listWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listWeek",
        }}
        events={events}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        eventContent={eventContent}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }}
        height="auto"
        eventDisplay="block"
        stickyHeaderDates
      />
    </div>
  );
};

export default EnterpriseCalendar;
