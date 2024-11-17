// src/app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from 'next/server';

import dayjs from 'dayjs';
import db from '@/db/db';



export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    // Check if token has expired
    if (dayjs().isAfter(dayjs(verificationToken.expires))) {
      return NextResponse.json({ error: 'Token has expired.' }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Update the user's emailVerified field
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the verification token to prevent reuse
    await db.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Email verified successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
  }
}
