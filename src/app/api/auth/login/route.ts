// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { serialize } from 'cookie';
import { signToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const config = {
  runtime: 'nodejs', // Node.js runtime for bcrypt
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find the user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // To prevent user enumeration, use the same error message
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Create JWT using jose
    const token = await signToken({ userId: user.id, email: user.email });

    // Set cookie
    const cookie = serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict',
    });

    return NextResponse.json({ message: 'Login successful.' }, {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
