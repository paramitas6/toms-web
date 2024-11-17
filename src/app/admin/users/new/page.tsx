"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addUser, updateUser } from "../../_actions/users";
import { useFormState, useFormStatus } from "react-dom";
import { User } from "@prisma/client";
import { PageHeader } from "../../_components/PageHeader";

export default function UserForm({ user }: { user?: User | null }) {
  const [error, action] = useFormState(
    user == null ? addUser : updateUser.bind(null, user.id),
    {}
  );

  return (
    <>
            <PageHeader>{user ? 'Edit Customer' : 'New Customer'}</PageHeader>
      <div className="container  shadow-lg p-10">

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
            {error.email && (
              <div className="text-destructive">{error.email}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Phone</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={user?.phone || ""}
            />
            {error.email && (
              <div className="text-destructive">{error.email}</div>
            )}
          </div>
          <SubmitButton />
        </form>
      </div>
    </>
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
