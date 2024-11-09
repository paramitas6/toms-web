// src/app/api/admin/settings/home/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/db/db"; // Ensure this points to your Prisma client
import formidable from "formidable";
import { IncomingMessage } from "http";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const form = new formidable.IncomingForm();

  try {
    const data = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(request as unknown as IncomingMessage, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      }
    );

    const { fields, files } = data;

    // Extract overlayText
    const overlayText = Array.isArray(fields.overlayText) ? fields.overlayText[0] : (fields.overlayText as string | undefined);

    // Handle background image upload
    let backgroundImagePath = fields.backgroundImage as string | undefined;
    if (files.backgroundImage) {
      const file = Array.isArray(files.backgroundImage) ? files.backgroundImage[0] : (files.backgroundImage as formidable.File);

      // Validate file type
      if (!file.mimetype?.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid image file type." },
          { status: 400 }
        );
      }

      // Save the image to public/home-backgrounds
      await fs.mkdir("public/home-backgrounds", { recursive: true });
      const uniqueSuffix = crypto.randomUUID();
      const ext = path.extname(file.originalFilename || "image.jpg");
      const fileName = `${uniqueSuffix}${ext}`;
      backgroundImagePath = `/home-backgrounds/${fileName}`;
      const destPath = path.join(process.cwd(), "public", "home-backgrounds", fileName);
      await fs.copyFile(file.filepath, destPath);
    }

    // Update or create home settings
    const existingSetting = await db.homeSetting.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (existingSetting) {
      await db.homeSetting.update({
        where: { id: existingSetting.id },
        data: {
          overlayText: overlayText || existingSetting.overlayText,
          backgroundImage: backgroundImagePath || existingSetting.backgroundImage,
        },
      });
    } else {
      await db.homeSetting.create({
        data: {
          overlayText: overlayText || "LET YOUR HEART BLOOM",
          backgroundImage: backgroundImagePath || "/home-backgrounds/default.jpg",
        },
      });
    }

    return NextResponse.json({ message: "Home settings updated successfully." });
  } catch (error) {
    console.error("Error updating home settings:", error);
    return NextResponse.json(
      { error: "Failed to update home settings." },
      { status: 500 }
    );
  }
}
