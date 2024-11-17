// src/types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    phone?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    emailVerified?: Date | null;
  }
}
