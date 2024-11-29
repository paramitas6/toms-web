// src/app/admin/carousel/page.tsx

import React from "react";
import CarouselManager from "./CarouselManager";

export default function Page() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Carousel Images</h1>
      <CarouselManager />
    </div>
  );
}
