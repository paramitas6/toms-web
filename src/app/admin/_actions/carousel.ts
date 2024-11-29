// src/app/admin/carousel/_actions/carousel.ts

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
  usedFor: z.string().optional(),
});

// Schema for deleting a carousel image
const deleteCarouselImageSchema = z.object({
  id: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().int().positive()),
});

// Type definitions for responses
type AddCarouselImageResult = { errors?: string[] };
type DeleteCarouselImageResult = { errors?: string };

// Action to add a new carousel image
export async function addCarouselImage(formData: FormData): Promise<AddCarouselImageResult> {
  const result = addCarouselImageSchema.safeParse(Object.fromEntries(formData.entries()));
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
      usedFor: data.usedFor, // Set the usedFor field
      
    },
  });

  return {}; // Indicate success
}

// Action to delete a carousel image
export async function deleteCarouselImage(formData: FormData): Promise<DeleteCarouselImageResult> {
  const result = deleteCarouselImageSchema.safeParse(Object.fromEntries(formData.entries()));
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



// Schema for updating a carousel image
const updateCarouselImageSchema = z.object({
  id: z.number().int().positive(),
  usedFor: z.string().min(1, { message: "usedFor is required" }),
});

// Type definition for update result
type UpdateCarouselImageResult = { errors?: string[] };

// Action to update the 'usedFor' field of a carousel image
export async function updateCarouselImage(
  id: number,
  usedFor: string
): Promise<UpdateCarouselImageResult> {
  // Validate inputs
  const result = updateCarouselImageSchema.safeParse({ id, usedFor });
  if (!result.success) {
    const errors = result.error.formErrors.fieldErrors;
    const formattedErrors: string[] = [];
    if (errors.id) formattedErrors.push(...errors.id);
    if (errors.usedFor) formattedErrors.push(...errors.usedFor);
    return { errors: formattedErrors.length > 0 ? formattedErrors : ["Invalid input"] };
  }

  try {
    await db.carouselImage.update({
      where: { id },
      data: { usedFor },
    });

    return {}; // Indicate success
  } catch (error) {
    console.error("Error updating carousel image:", error);
    return { errors: ["Failed to update carousel image."] };
  }
}