import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import db from "@/db/db";
import { formatNumber } from "@/lib/formatters";
import UserActionsDropdown from "./_components/UserActionsDropdown";

export default function AdminUsersPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Customers</PageHeader>
        <Button asChild>
          <Link href="/admin/users/new">Create Customer</Link>
        </Button>
      </div>
      <div className="mt-8">
        <UsersTable />
      </div>
    </>
  );
}

async function UsersTable() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  if (users.length === 0) {
    return <p>No users found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Email Verified</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.phone}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
            <TableCell>{formatNumber(user._count.orders)}</TableCell>
            <TableCell>
              <UserActionsDropdown userId={user.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
