// src/app/api/auth/user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import db from '@/db/db';

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY || 'your_secret_key');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify JWT using jose
    const { payload } = await jwtVerify(token, SECRET_KEY);

    // Extract user ID from payload
    const userId = payload.userId as string;

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
