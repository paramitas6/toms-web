// src/contexts/UserContext.tsx
"use client"
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";



interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // Add other user properties as needed
}

interface UserContextProps {
  user: User | null;
  logout: () => Promise<void>;
  // Optionally, add other auth functions like login, register as needed
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  logout: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const {toast}  = useToast();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/user", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
      });
      if (res.ok) {
        setUser(null);
        toast({
          variant: 'success',
          description: 'Logged out successfully.',
        });
        router.push("/"); // Redirect to homepage after logout
      } else {
        console.error("Failed to logout");
        toast({
          variant: 'destructive',
          description: 'Failed to logout. Please try again.',
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        variant: 'destructive',
        description: 'An unexpected error occurred during logout.',
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, logout }}>
      {children}
    </UserContext.Provider>
  );
};
