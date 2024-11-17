"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  changeOrderStatus,
  captureTransaction,
  deleteOrder,
  fetchTransactionStatus,
} from "../../_actions/orders";
import { makeInvoice } from "../utils/makeInvoice";

import { useEffect, useState } from "react";
import { Order as PrismaOrder, OrderItem } from "@prisma/client";

interface StatusDropdownItemProps {
  id: string;
  currentStatus:
    | "payment pending"
    | "in progress"
    | "ready to be picked up"
    | "picked up";
}

interface Order extends PrismaOrder {
  orderItems: OrderItem[];
}

// Define all possible statuses with their display labels
const statuses = [
  { value: "payment pending", label: "Payment Pending" },
  { value: "in progress", label: "In Progress" },
  { value: "ready to be picked up", label: "Ready" },
  { value: "picked up", label: "Picked Up" },
];

// Function to get styles based on status
const getStatusStyles = (status: string): string => {
  switch (status) {
    case "payment pending":
      return "bg-red-100 text-red-800 rounded px-2 py-1 capitalize";
    case "in progress":
      return "bg-yellow-100 text-yellow-800 rounded px-2 py-1 capitalize";
    case "ready to be picked up":
      return "bg-blue-100 text-blue-800 rounded px-2 py-1 capitalize";
    case "picked up":
      return "bg-green-100 text-green-800 rounded px-2 py-1 capitalize font-bold";
    default:
      return "bg-gray-100 text-gray-800 rounded px-2 py-1 capitalize";
  }
};

export function StatusDropdownItem({
  id,
  currentStatus,
}: StatusDropdownItemProps) {
  const router = useRouter();

  const setStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) return; // Prevent setting the same status

    try {
      await changeOrderStatus(id, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to change order status:", error);
      alert("Failed to change order status. Please try again.");
    }
  };

  return (
    <>
      {statuses.map((status) => (
        <DropdownMenuItem
          key={status.value}
          onSelect={() => setStatus(status.value)}
          disabled={status.value === currentStatus}
          className={getStatusStyles(status.value)} // Apply styles here
        >
          {status.value !== currentStatus ? (
            `Set Status to ${status.label}`
          ) : (
            <span className="text-gray-500">Current: {status.label}</span>
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function PrintReceiptDropdownItem({ orderId }: { orderId: string }) {
  const handlePrintReceipt = async () => {
    await fetch("/api/print/receipt", {
      method: "POST",
      body: JSON.stringify({ orderId}),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <DropdownMenuItem onSelect={handlePrintReceipt}>
      Print Receipt
    </DropdownMenuItem>
  );
}

export function PrintTicketDropdownItem({ orderId }: { orderId: string }) {
  const handlePrintReceipt = async () => {
    await fetch("/api/print/ticket", {
      method: "POST",
      body: JSON.stringify({ orderId}),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <DropdownMenuItem onSelect={handlePrintReceipt}>
      Print Ticket
    </DropdownMenuItem>
  );
}

export function PrintDeliveryDropdownItem({ orderId }: { orderId: string }) {
  const handlePrintDeliveryDetails = async () => {
    try {
      const response = await fetch("/api/print/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error printing delivery details:", error);
      alert("Failed to print delivery details");
    }
  };

  return (
    <DropdownMenuItem onSelect={handlePrintDeliveryDetails}>
      Print Delivery Details
    </DropdownMenuItem>
  );
}

interface CaptureTransactionDropdownItemProps {
  orderId: string;
}
export function GenerateInvoiceDropdownItem({
  order,
}: GenerateInvoiceDropdownItemProps) {
  const generateAndDownload = () => {
    makeInvoice(order);
  };

  return (
    <DropdownMenuItem onSelect={generateAndDownload}>
      Generate Invoice PDF
    </DropdownMenuItem>
  );
}
export function CaptureTransactionDropdownItem({
  orderId,
}: CaptureTransactionDropdownItemProps) {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isDelivery, setIsDelivery] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkTransactionStatus = async () => {
      try {
        const status = await fetchTransactionStatus(orderId);
        console.log(status);
        setIsPaid(status.transactionStatus === "Paid");
        setIsDelivery(status.isDelivery === true);
      } catch (error) {
        console.error("Error fetching transaction status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTransactionStatus();
  }, [orderId]);

  const captureTransactionHandler = async () => {
    if (!orderId) {
      alert("No preauthorized transaction found for this order.");
      return;
    }

    try {
      await captureTransaction(orderId);
      alert("Transaction successfully captured.");
      router.refresh();
    } catch (error) {
      console.error("Error capturing transaction:", error);
      alert(
        "Failed to capture transaction. Please check the transaction status."
      );
    }
  };

  return (
    <>

      <DropdownMenuItem
        onSelect={captureTransactionHandler}
        disabled={isPaid || isLoading}
        className={isPaid ? "text-gray-400 cursor-not-allowed" : ""}
      >
        {isPaid ? "Payment Already Processed" : "Process Payment"}
      </DropdownMenuItem>

    </>
  );
}

interface DeleteOrderDropdownItemProps {
  id: string;
}

export function DeleteOrderDropdownItem({ id }: DeleteOrderDropdownItemProps) {
  const router = useRouter();

  const deleteOrderHandler = async () => {
    const confirmed = confirm("Are you sure you want to delete this order?");
    if (!confirmed) return;

    try {
      await deleteOrder(id); // Call the server action directly
      alert("Order deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("An error occurred while deleting the order.");
    }
  };

  return (
    <DropdownMenuItem onSelect={deleteOrderHandler} className="text-red-600">
      Delete Order
    </DropdownMenuItem>
  );
}

interface GenerateInvoiceDropdownItemProps {
  order: Order;
}


