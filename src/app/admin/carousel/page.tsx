// src/app/admin/carousel/page.tsx

import React from "react";
import CarouselManager from "./CarouselManager";
import db from "@/db/db";
import { CarouselImage as PrismaCarouselImage } from "@prisma/client";

// Define the type for a carousel image
type CarouselImage = {
  id: number;
  imageUrl: string;
  isActive: boolean;
};

export default async function Page() {
  // Fetch carousel images from the database, ordered by creation date descending
  const carouselImages: PrismaCarouselImage[] = await db.carouselImage.findMany({
    where: { isActive: true }, // Only fetch active images
    orderBy: { createdAt: "desc" },
  });

  // Map PrismaCarouselImage to our CarouselImage type if necessary
  const initialImages: CarouselImage[] = carouselImages.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    isActive: img.isActive,
  }));

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Carousel Management</h1>
      <CarouselManager initialImages={initialImages} />
    </div>
  );
}
