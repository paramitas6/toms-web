"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { deleteUser } from "../../_actions/users";

interface UserActionsDropdownProps {
  userId: string;
}

export default function UserActionsDropdown({ userId }: UserActionsDropdownProps) {
  const handleDelete = async () => {
    await deleteUser(userId);
    // Add any additional logic here, like refreshing data or showing a confirmation
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical />
        <span className="sr-only">Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${userId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <hr />
        <DropdownMenuItem onClick={handleDelete} className="text-red-500">
          REMOVE
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
