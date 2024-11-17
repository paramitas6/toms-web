// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/db/db"; // Adjust path if needed

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
