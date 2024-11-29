// src/app/admin/orders/_components/OrdersTable.tsx

"use client";

import Link from "next/link";
import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Truck,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  DeleteOrderDropdownItem,
  StatusDropdownItem,
  CaptureTransactionDropdownItem,
  GenerateInvoiceDropdownItem,
  PrintDeliveryDropdownItem,
  PrintReceiptDropdownItem,
  PrintTicketDropdownItem,
} from "../_components/OrderActions";

import {
  Order as PrismaOrder,
  OrderItem,
  DeliveryDetails,
  Product,
  User,
  Image,
} from "@prisma/client";

import dayjs from "dayjs"; // Import Day.js
import { FaGlobe, FaStore } from "react-icons/fa"; // Imported but not used; consider removing if unnecessary

interface AdminOrder extends PrismaOrder {
  user: User | null;
  orderItems: (OrderItem & {
    product:
      | (Product & {
          images: Image[];
        })
      | null;
  })[];
  deliveryDetails?: DeliveryDetails | null;
}

interface OrdersTableProps {
  orders: AdminOrder[];
}

type OrderData = {
  originalOrder: AdminOrder;
  id: string;
  createdAt: string;
  customer: string;
  items: string;
  totalPrice: string;
  status: string;
  deliveryOption: string;
  isDelivery: boolean;
  deliverySchedule: string; // Combined delivery date and time
  deliveryAddress?: string | null; // Optional delivery address
  notes?: string | null; // New field for notes
  orderItems: {
    quantity: number;
    product?: {
      name?: string;
      description?: string | null;
    } | null;
    description?: string | null;
  }[];
};

// Helper function to map status to styles
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

// Helper function to get delivery icon
const getDeliveryIcon = (isDelivery: boolean) => {
  return isDelivery ? (
    <Truck className="h-6 w-6 text-gray-700" />
  ) : (
    <ShoppingBag className="h-6 w-6 text-gray-700" />
  );


};
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "online":
      return <FaGlobe className="h-6 w-6 text-blue-500" />;
    default:
      return null;
  }
};
export const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Order Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = dayjs(row.original.createdAt);
      return <span>{date.format("MMM D, 'YY")}</span>; // e.g., "Nov 14, '24"
    },
    sortingFn: "datetime",
    size: 30,
    minSize: 30,
    maxSize: 80,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Customer
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.customer}</span>,
    size: 80,
    minSize: 50,
    maxSize: 80,
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Items
      </Button>
    ),
    cell: ({ row }) => (
      <ul className="list-disc list-inside">
        {row.original.orderItems.map((item, idx) => (
          <li key={idx}>
            {item.quantity} x{" "}
            {item.product
              ? item.product.name ||
                item.product.description ||
                "Unnamed Product"
              : item.description || "Custom Item"}
          </li>
        ))}
      </ul>
    ),
    size: 150,
    minSize: 100,
    maxSize: 200,
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-right"
      >
        Price
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-right">{row.original.totalPrice}</span>
    ),
    size: 50,
    minSize: 50,
    maxSize: 80,
  },
  // New "Notes" Column
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Notes
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.notes}</span>,
    size: 150,
    minSize: 150,
    maxSize: 200,
  },
  // Combined Status and Delivery Column
  {
    id: "statusDelivery",
    accessorKey: "status", // Using accessorKey for sorting purposes
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { status, isDelivery, originalOrder } = row.original;
      const categoryIcon = getCategoryIcon(originalOrder.category || "");
      return (
        <div className="flex items-center space-x-2">
          {categoryIcon}
          {getDeliveryIcon(isDelivery)}
          <div className={getStatusStyles(status)}>{status}</div>
        </div>
      );
    },
    size: 150,
    minSize: 120,
    maxSize: 200,
  },
  {
    accessorKey: "deliverySchedule",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Schedule
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.deliverySchedule || "N/A",
    sortingFn: "datetime",
    size: 150,
    minSize: 120,
    maxSize: 200,
  },
  {
    accessorKey: "deliveryAddress",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Delivery Address
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.deliveryAddress || "N/A",
    size: 200,
    minSize: 150,
    maxSize: 250,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      const orderId = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* Print Subset */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Print</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <GenerateInvoiceDropdownItem
                      order={row.original.originalOrder}
                    />
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
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Status Subset */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Status</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <StatusDropdownItem
                    id={orderId}
                    currentStatus={
                      row.original.status as
                        | "payment pending"
                        | "in progress"
                        | "ready to be picked up"
                        | "picked up"
                    }
                  />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Payment Subset */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Payment</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <CaptureTransactionDropdownItem orderId={orderId} />
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* General Actions */}
            <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link href={`/admin/orders/${orderId}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/orders/${orderId}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DeleteOrderDropdownItem id={orderId} />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 50,
    minSize: 50,
    maxSize: 50,
  },
];

// Define default column sizing
const defaultColumnSizing = {
  size: 50,
  minSize: 30,
  maxSize: 100,
};

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>(""); // Added global filter state
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const data: OrderData[] = React.useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      createdAt: formatDate(order.createdAt).toString(),
      customer: order.user?.name||order.guestName || "Walk In",
      items: order.orderItems
        .map(
          (item) =>
            `${item.quantity} x ${
              item.product
                ? item.product.name ||
                  item.product.description ||
                  "Unnamed Product"
                : item.description || "Custom Item"
            }`
        )
        .join(", "),
      totalPrice: formatCurrency(order.pricePaidInCents / 100),
      status: order.status.toString(),
      deliveryOption: order.isDelivery ? "Delivery" : "Pick Up",
      isDelivery: order.isDelivery ?? false,
      originalOrder: order,
      deliverySchedule:
      order.deliveryDate && order.deliveryTime
        ? order.deliveryTime.includes("-")
          ? `${dayjs(order.deliveryDate).format("ddd, MMM D")}, ${order.deliveryTime}`
          : dayjs(order.deliveryDate)
              .set(
                "hour",
                parseInt(order.deliveryTime.split(":")[0].trim(), 10)
              )
              .set(
                "minute",
                order.deliveryTime.includes(":")
                  ? parseInt(order.deliveryTime.split(":")[1].trim(), 10)
                  : 0
              )
              .format("ddd, MMM D, h:mm A")
        : "N/A",
      deliveryAddress: order.deliveryDetails?.deliveryAddress || null,
      notes: order.notes || "", // Mapping the notes field
      orderItems: order.orderItems.map((item) => ({
        quantity: item.quantity,
        product: item.product
          ? {
              name: item.product.name,
              description: item.product.description,
            }
          : null,
        description: item.description || null,
      })),
    }));
  }, [orders]);

  const columnsMemo = React.useMemo(() => columns, []);

  const table = useReactTable({
    data,
    columns: columnsMemo,
    defaultColumn: defaultColumnSizing,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    enableGlobalFilter: true,
    columnResizeMode: "onChange",
  });


  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {/* Global Filter Input */}
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-x-auto relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isActionsColumn = header.id === "actions";
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        isActionsColumn ? "sticky right-0 bg-white z-10" : ""
                      }
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanResize() && (
                            <div
                              {...{
                                onMouseDown: header.getResizeHandler(),
                                onTouchStart: header.getResizeHandler(),
                                className: `resizer ${
                                  header.column.getIsResizing()
                                    ? "isResizing"
                                    : ""
                                }`,
                              }}
                            />
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionsColumn = cell.column.id === "actions";
                    return (
                      <TableCell
                        key={cell.id}
                        className={
                          isActionsColumn ? "sticky right-0 bg-white z-10" : ""
                        }
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) found.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
