// src/app/api/carousel/images/route.ts

import { NextResponse } from "next/server";
import { getCarouselImages } from "@/app/(customerFacing)/_actions/Carousel";

export async function GET() {
  try {
    const images = await getCarouselImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel images." },
      { status: 500 }
    );
  }
}
