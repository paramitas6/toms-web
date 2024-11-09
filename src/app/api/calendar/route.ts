// src/app/api/calendar/route.ts
"use server";
import db from "@/db/db";
import dayjs from "dayjs";

export async function getOrdersInRange(startDate: Date, endDate: Date) {
  const orders = await db.order.findMany({
    where: {
      deliveryDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      isDelivery: true,
      deliveryTime: true,
      deliveryDate: true,
      recipientName: true,
      status: true,
      orderItems: {
        select: {
          quantity: true,
          description: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      // Include other fields if necessary
    },
  });

  function convertTo24HourFormat(timeString:String) {
    const [time, period] = timeString.split(" ");
    let hour = parseInt(time, 10);

    if (period === "PM" && hour !== 12) {
        hour += 12;
    } else if (period === "AM" && hour === 12) {
        hour = 0;
    }

    return hour;
}

  return orders.map((order) => {
    // Generate the item descriptions
    const itemsDescription = order.orderItems
      .map((item) => {
        // Use 'description' if available, otherwise fallback to 'product.name'
        const itemDesc = item.description || item.product?.name || "Item";
        // Capitalize the first letter
        const capitalizedDesc =
          itemDesc.charAt(0).toUpperCase() + itemDesc.slice(1);
        return `${item.quantity} ${capitalizedDesc}`;
      })
      .join(", "); // You can use ', ' if you prefer comma separation

    // Append the recipient name if it exists
    const title = (order.isDelivery? "(Delivery) " : "(Pickup) ")  +
      itemsDescription +
      (order.recipientName ? ` for ${order.recipientName}` : "");
    // Parse deliveryTime and extract the start time
    const timeRange = order.deliveryTime?.split("-");
    const startTimeString = timeRange ? timeRange[0].trim() : "9:00 AM"; // Default to "9:00 AM" if not provided

    // Combine deliveryDate and startTimeString to create a Date object for start
    const start = dayjs(order.deliveryDate?.toISOString())
      .hour(convertTo24HourFormat(startTimeString)).toDate();


    console.log(start)

    return {
      id: order.id,
      title: title,
      start: start,
      status: order.status,
      allDay: false, // Assuming deliveries are all-day events
      // Include other fields if necessary
    };
  });
}
