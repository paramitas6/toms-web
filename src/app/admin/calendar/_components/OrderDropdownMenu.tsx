"use client";

import Link from "next/link";
import React from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DeleteOrderDropdownItem,
  StatusDropdownItem,
  CaptureTransactionDropdownItem,
  GenerateInvoiceDropdownItem,
  PrintDeliveryDropdownItem,
  PrintReceiptDropdownItem,
  PrintTicketDropdownItem,
} from "@/app/admin/orders/_components/OrderActions";
import { Order as PrismaOrder, OrderItem } from "@prisma/client";
import { Select } from "@/components/ui/select";

interface OrderDropdownMenuProps {
  order: PrismaOrder & { orderItems?: OrderItem[] };
  onClose: () => void;
}

export const OrderDropdownMenu: React.FC<OrderDropdownMenuProps> = ({
  order,
  onClose,
}) => {
  const orderWithItems = { ...order, orderItems: order.orderItems || [] };
  const orderId = order.id;

  return (
    <div className="bg-white shadow-md border rounded-md p-2 z-50">
      {/* Print Options */}

    
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
           HI
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <GenerateInvoiceDropdownItem order={orderWithItems} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <PrintTicketDropdownItem orderId={orderId} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <PrintDeliveryDropdownItem orderId={orderId} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <PrintReceiptDropdownItem orderId={orderId} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
