
// src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db"; // Adjust the path to your Prisma instance

export async function POST(req: NextRequest) {
  const { name, email, phone } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    await db.user.create({
      data: {
        name,
        email,
        phone,
      },
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
