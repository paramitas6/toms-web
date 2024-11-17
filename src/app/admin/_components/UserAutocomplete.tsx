// src/app/admin/_components/UserAutocomplete.tsx

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { User } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserAutocompleteProps {
  users: User[];
  selectedId: string | null;
  onSelect: (user: User | null) => void;
}

export default function UserAutocomplete({
  users,
  selectedId,
  onSelect,
}: UserAutocompleteProps) {
  const [open, setOpen] = React.useState(false);

  // Memoize the selected user for performance
  const selectedUser = React.useMemo(() => {
    return users.find((user) => user.id === selectedId) || null;
  }, [users, selectedId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? selectedUser.name : "Walk In"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name || ""} // Used for filtering
                  onSelect={() => {
                    // Toggle selection
                    if (selectedId === user.id) {
                      onSelect(null); // Deselect if already selected
                    } else {
                      onSelect(user); // Select the new user
                    }
                    setOpen(false); // Close the Popover after selection
                  }}
                >
                  {user.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
