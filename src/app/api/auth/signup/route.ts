// src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const config = {
  runtime: 'nodejs', // Node.js runtime for bcrypt
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }

    const { email, name, password, phone } = validation.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone,
      },
    });

    // Optionally, automatically log the user in after signup
    // const token = await signToken({ userId: user.id, email: user.email });
    // const cookie = serialize('auth', token, { ... });

    return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
