// src/lib/auth.ts

import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY || 'your_secret_key');

export interface AuthPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export async function signToken(payload: AuthPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(SECRET_KEY);
  return jwt;
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as AuthPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get('auth');
  return cookie ? cookie.value : null;
}
