// src/app/(customerFacing)/user/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/db/db";
import Link from "next/link";
import { Order, OrderItem } from "@prisma/client";

const UserPage = async () => {
  // Retrieve the session on the server side
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    // If there's no session, prompt the user to log in
    return (
      <div className="container mx-auto p-4 font-montserrat">
        <p>Please log in to view your orders.</p>
        <Link href="/login" className="text-blue-500">
          Go to Login
        </Link>
      </div>
    );
  }

  // Fetch user orders from the database
  const userEmail = session.user.email;

  try {
    const orders: (Order & { orderItems: OrderItem[] })[] = await db.order.findMany({
      where: { guestEmail: userEmail },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <div className="container mx-auto p-4 font-montserrat">
        <h1 className="text-5xl font-bold mb-4 font-gotham tracking-wider">Your Orders</h1>
        {orders.length === 0 ? (
          <p>You have no past orders.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">
                  Order placed on {new Date(order.createdAt).toLocaleDateString()}
                </h2>
                <p>Status: {order.status}</p>

                <h3 className="mt-2 font-semibold">Items:</h3>
                <ul className="list-disc list-inside">
                  {order.orderItems.map((item) => (
                    <li key={item.id}>
                      {item.description} - Quantity: {item.quantity} - Subtotal: $
                      {(item.subtotalInCents / 100).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <p>Total Amount Paid: ${(order.pricePaidInCents / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
        <Link href="/" className="mt-4 inline-block text-blue-500">
          Go Back to Home
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return (
      <div className="container mx-auto p-4 font-montserrat">
        <p>Sorry, there was an error retrieving your orders. Please try again later.</p>
        <Link href="/" className="text-blue-500">
          Go Back to Home
        </Link>
      </div>
    );
  }
};

export default UserPage;
