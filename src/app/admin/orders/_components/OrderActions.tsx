// src/app/admin/orders/_components/OrderActions.tsx

"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { changeOrderStatus, captureTransaction, deleteOrder, fetchTransactionStatus } from "../../_actions/orders"; // Import fetchTransactionStatus
import { makeInvoice } from "../utils/makeInvoice";
import { Order } from "../types";
import { useEffect, useState } from "react";

interface StatusDropdownItemProps {
  id: string;
  currentStatus: "payment pending" | "in progress" | "ready to be picked up" | "picked up";
}

// Define all possible statuses with their display labels
const statuses = [
  { value: "payment pending", label: "Payment Pending" },
  { value: "in progress", label: "In Progress" },
  { value: "ready to be picked up", label: "Ready" },
  { value: "picked up", label: "Picked Up" },
];

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

interface CaptureTransactionDropdownItemProps {
  orderId: string;
}

export function CaptureTransactionDropdownItem({
  orderId,
}: CaptureTransactionDropdownItemProps) {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkTransactionStatus = async () => {
      try {
        const status = await fetchTransactionStatus(orderId);
        console.log(status)
        setIsPaid(status === "Paid");
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
      alert("Failed to capture transaction. Please check the transaction status.");
    }
  };

  return (
    <DropdownMenuItem
      onSelect={captureTransactionHandler}
      disabled={isPaid || isLoading}
      className={isPaid ? "text-gray-400 cursor-not-allowed" : ""}
    >
      {isPaid ? "Payment Already Processed" : "Process Payment"}
    </DropdownMenuItem>
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

export function GenerateInvoiceDropdownItem({
  order,
}: GenerateInvoiceDropdownItemProps) {
  const generateAndDownload = () => {
    makeInvoice(order);
  };

  return (
    <DropdownMenuItem onSelect={generateAndDownload}>
      Generate Invoice
    </DropdownMenuItem>
  );
}
