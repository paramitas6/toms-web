// src/app/(customerFacing)/_actions/Carousel.ts

"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import crypto from "crypto";

// Define the schema for image validation
const imageSchema = z
  .instanceof(File, { message: "Image is required" })
  .refine(
    (file) => file.size > 0 && file.type.startsWith("image/"),
    "Invalid image"
  );

// Schema for adding a carousel image
const addCarouselImageSchema = z.object({
  image: imageSchema,
});

// Schema for deleting a carousel image
const deleteCarouselImageSchema = z.object({
  id: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().int().positive()
  ),
});

// Type definitions for responses
export type AddCarouselImageResult = { errors?: string[] };
export type DeleteCarouselImageResult = { errors?: string };

// Action to add a new carousel image
export async function addCarouselImage(
  formData: FormData
): Promise<AddCarouselImageResult> {
  const result = addCarouselImageSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!result.success) {
    // Extract error messages for the 'image' field
    const errors = result.error.formErrors.fieldErrors.image;
    return { errors: errors || ["Invalid input"] };
  }

  const data = result.data;

  // Save image to public/carousel
  await fs.mkdir("public/carousel", { recursive: true });
  const imageName = `${crypto.randomUUID()}-${data.image.name}`;
  const imagePath = `/carousel/${imageName}`;
  await fs.writeFile(
    `public${imagePath}`,
    new Uint8Array(await data.image.arrayBuffer())
  );

  // Save to database
  await db.carouselImage.create({
    data: {
      imageUrl: imagePath,
      isActive: true,
    },
  });

  return {}; // Indicate success
}

// Action to delete a carousel image
export async function deleteCarouselImage(
  formData: FormData
): Promise<DeleteCarouselImageResult> {
  const result = deleteCarouselImageSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!result.success) {
    const errors = result.error.formErrors.fieldErrors.id;
    return { errors: errors ? errors.join(", ") : "Invalid ID" };
  }

  const { id } = result.data;

  const carouselImage = await db.carouselImage.findUnique({
    where: { id }, // 'id' is now a number
  });

  if (!carouselImage) {
    return { errors: "Carousel image not found." };
  }

  // Delete the image file
  try {
    await fs.unlink(`public${carouselImage.imageUrl}`);
  } catch (error) {
    console.error("Failed to delete image file:", error);
    return { errors: "Failed to delete image file." };
  }

  // Delete from database
  await db.carouselImage.delete({
    where: { id },
  });

  return {}; // Indicate success
}

// ** New Function to Fetch Carousel Images **
export async function getCarouselImages() {
  return db.carouselImage.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 10, // Adjust as needed
  });
}
