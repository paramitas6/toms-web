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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  GenerateInvoiceDropdownItem
} from "../_components/OrderActions"

import { Order } from "../types";

interface OrdersTableProps {
  orders: Order[];
}

type OrderData = {
  originalOrder: Order;
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



export const columns: ColumnDef<OrderData>[] = [
  // Removed the selection column

  
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
    cell: ({ row }) => <span>{row.original.createdAt}</span>,
    sortingFn: "datetime",
    size: 30, // Set smaller size
    minSize: 30,
    maxSize: 100,
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
    size: 80, // Set smaller size
    minSize: 50,
    maxSize: 100,
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
    size:200, // Set smaller size
    minSize: 150,
    maxSize: 250,
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
    size: 50, // Set smaller size
    minSize: 50,
    maxSize: 80,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Status

      </Button>
    ),
    cell: ({ row }) => (
      <div className={getStatusStyles(row.original.status)}>
        {row.original.status}
      </div>
    ),
    size: 120, // Set smaller size
    minSize: 100,
    maxSize: 160,
  },
  {
    accessorKey: "deliveryOption",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full text-left"
      >
        Delivery
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.deliveryOption}</span>,
    size: 120, // Set smaller size
    minSize: 100,
    maxSize: 160,
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
    size: 150, // Set smaller size
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
    size: 200, // Set smaller size
    minSize: 150,
    maxSize: 250,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => null, // No header for actions
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${orderId}/edit`}>Edit</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <StatusDropdownItem id={orderId} currentStatus={row.original.status as "payment pending" | "in progress" | "ready to be picked up" | "picked up"} />
            <DeleteOrderDropdownItem id={orderId} />
            <CaptureTransactionDropdownItem
              orderId={orderId}
            />
            <GenerateInvoiceDropdownItem order={row.original.originalOrder} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 50, // Fixed smaller size
    minSize: 50,
    maxSize: 50,
  },
];

// Define default column sizing
const defaultColumnSizing = {
  size: 50, // Starting column size
  minSize: 30, // Enforced during column resizing
  maxSize: 100, // Enforced during column resizing
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
      customer: order.user?.name || "Walk In",
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
      deliverySchedule: order.deliveryDate && order.deliveryTime
        ? `${formatDate(new Date(order.deliveryDate))} ${order.deliveryTime}`
        : "N/A",
      deliveryAddress: order.deliveryAddress || null, // Ensure it's string | null | undefined
      orderItems: order.orderItems,
    }));
  }, [orders]);

  const columnsMemo = React.useMemo(() => columns, []);

  const table = useReactTable({
    data,
    columns: columnsMemo,
    defaultColumn: defaultColumnSizing, // Apply default column sizing
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
    globalFilterFn: 'includesString', // Use built-in includesString filter function
    onGlobalFilterChange: setGlobalFilter, // Handle global filter changes
    enableGlobalFilter: true, // Enable global filtering
    columnResizeMode: 'onChange', // Optional: Change to 'onChange' for immediate resizing
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
                        isActionsColumn
                          ? "sticky right-0 bg-white z-10"
                          : ""
                      }
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : (
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
                                    header.column.getIsResizing() ? "isResizing" : ""
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
                          isActionsColumn
                            ? "sticky right-0 bg-white z-10"
                            : ""
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
