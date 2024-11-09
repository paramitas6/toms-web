"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { User } from "@prisma/client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { fetchUsers } from "../_actions/users"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function ComboboxDemo() {
  // State to control the Popover's open state
  const [open, setOpen] = React.useState(false)
  
  // State to store the selected user's ID
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  
  // State to store the list of users
  const [users, setUsers] = React.useState<User[]>([])

  // Fetch users on component mount
  React.useEffect(() => {
    fetchUsers().then(setUsers)
  }, [])

  // Memoize the selected user for performance
  const selectedUser = React.useMemo(() => {
    return users.find(user => user.id === selectedId)
  }, [users, selectedId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {/* Display the selected user's name or a placeholder */}
          {selectedUser ? selectedUser.name : "Select Customer"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {/* Input for searching users */}
          <CommandInput placeholder="Search user..." />
          <CommandList>
            {/* Display when no users match the search */}
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {/* Iterate over users to display as CommandItems */}
              {users.map(user => (
                <CommandItem
                  key={user.id}
                  value={user.name} // Set value to user.name for search functionality
                  onSelect={(selectedValue) => {
                    // Find the user by name
                    const user = users.find(u => u.name === selectedValue)
                    if (user) {
                      // Toggle selection
                      if (selectedId === user.id) {
                        setSelectedId(null) // Deselect if already selected
                      } else {
                        setSelectedId(user.id) // Select the new user
                      }
                    }
                    setOpen(false) // Close the Popover after selection
                  }}
                >
                  {/* Display the user's name */}
                  {user.name}
                  {/* Show a check icon if the user is selected */}
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
  )
}
