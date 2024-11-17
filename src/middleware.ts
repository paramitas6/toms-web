// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isValidPassword } from "@/lib/isValidPassoword";

// Define the paths to protect
const ADMIN_PATHS = /^\/admin(\/|$)/;
const USER_PATHS = /^\/user(\/|$)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle Admin Routes with Basic Authentication
  if (ADMIN_PATHS.test(pathname)) {
    if (!(await isAdminAuthenticated(request))) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": "Basic realm='Secure Area'" },
      });
    }
  }

  // Handle User Routes with NextAuth.js Session Authentication
  if (USER_PATHS.test(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Redirect unauthenticated users to the login page
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?callbackUrl=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to proceed if no authentication is required
  return NextResponse.next();
}

// Helper function to authenticate admin routes using Basic Auth
async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  // Decode the Base64 encoded credentials
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [username, password] = credentials.split(":");

  if (!username || !password) {
    return false;
  }

  // Compare with environment variables
  const isUsernameValid = username === process.env.ADMIN_USERNAME;
  const isPasswordValid = await isValidPassword(password, process.env.HASHED_ADMIN_PASSWORD as string);

  return isUsernameValid && isPasswordValid;
}

// Middleware configuration to match admin and user routes
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
