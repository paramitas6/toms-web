// src/app/api/carousel/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCarouselImages, getAllCarouselImages } from "@/app/(customerFacing)/_actions/Carousel";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const usedFor = url.searchParams.get("usedFor"); // Correctly extract 'usedFor'

    if (usedFor) {
      const images = await getCarouselImages(usedFor);
      return NextResponse.json(images);
    } else {
      // Optionally, return all images or return an error
      const images = await getAllCarouselImages();
      return NextResponse.json(images);
    }
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel images." },
      { status: 500 }
    );
  }
}
