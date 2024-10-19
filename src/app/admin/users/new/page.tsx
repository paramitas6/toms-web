"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { addUser, updateUser } from "../../_actions/users";
import { useFormState, useFormStatus } from "react-dom";
import { User } from "@prisma/client";

export default function UserForm({ user }: { user?: User | null }) {
  const [error, action] = useFormState(
    user == null ? addUser : updateUser.bind(null, user.id),
    {}
  );

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={user?.name || ""}
        />
        {error.name && <div className="text-destructive">{error.name}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={user?.email || ""}
        />
        {error.email && <div className="text-destructive">{error.email}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          required={user == null}
          defaultValue={user?.password || ""}
        />
        {error.password && <div className="text-destructive">{error.password}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role">
          <SelectTrigger>
            <SelectValue placeholder="Please choose...." />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}