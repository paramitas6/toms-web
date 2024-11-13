// src/app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  try {
    // Clear the 'auth' cookie by setting it to an empty value and expiring it immediately
    const cookie = serialize('auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(0), // Expire the cookie immediately
      sameSite: 'strict',
    });

    return NextResponse.json({ message: 'Logged out successfully.' }, {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
