// src/middleware.ts


import { NextRequest, NextResponse } from "next/server";
import { isValidPassword } from "./lib/isValidPassoword";
import { verifyToken, getTokenFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin authentication for paths under "/admin"
  if (pathname.startsWith('/admin')) {
    if (await isAuthenticated(request) === false) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": "Basic" },
      });
    }
  }

  // Customer-facing authentication for paths under "/user"
  else if (pathname.startsWith('/user')) {
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Admin authentication helper
async function isAuthenticated(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return false;

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");

  return (
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(password, process.env.HASHED_ADMIN_PASSWORD as string))
  );
}

// Middleware configuration
export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};