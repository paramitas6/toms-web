// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import db from "@/db/db"; // Adjust the path to your Prisma instance

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists in the database
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ exists: true });
    } else {
      // User does not exist, prompt to sign up
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
