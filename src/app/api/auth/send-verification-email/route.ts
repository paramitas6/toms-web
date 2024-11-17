// src/app/api/auth/send-verification-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/email'; // Your email sending function
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // To prevent user enumeration, respond with a generic message
      return NextResponse.json({ message: 'Verification email sent successfully.' }, { status: 200 });
    }

    // Generate a unique token
    const token = uuidv4();

    // Set expiration time (e.g., 1 hour from now)
    const expires = dayjs().add(1, 'hour').toDate();

    // Create a VerificationToken entry
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email,token);

    return NextResponse.json({ message: 'Verification email sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Failed to send verification email.' }, { status: 500 });
  }
}
