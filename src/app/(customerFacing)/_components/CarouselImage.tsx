// src/app/(customerFacing)/_components/CarouselImage.tsx
"use client";

import React from "react";
import Image from "next/image";
import useSWR from "swr";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";

interface CarouselImageProps {
  innerText?: string;
}

interface CarouselImageType {
  id: number;
  imageUrl: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CarouselImage: React.FC<CarouselImageProps> = ({ innerText }) => {
  const { data: carouselImages, error } = useSWR<CarouselImageType[]>(
    "/api/carousel/images",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 } // 60 seconds
  );

  if (!carouselImages && !error) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Unable to load carousel images.</div>;
  }

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 4000,
        }),
        Fade({}), // Add the fade transition plugin
      ]}
      className="w-full h-full"
    >
      <CarouselContent>
        {carouselImages && carouselImages.map((image) => (
          <CarouselItem key={image.id}>
            <div className="relative w-full h-[40vh]">
              <Image
                alt="Carousel Image"
                src={image.imageUrl}
                fill={true}
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default CarouselImage;
