// src/contexts/UserContext.tsx

import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  phone?: string;
  image?: string;
  // Add other user properties as needed
}

interface UserContextType {
  user: User | null;
  login: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  // Add other authentication methods as needed
}

export const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data on mount if needed
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, token: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Logout failed');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
