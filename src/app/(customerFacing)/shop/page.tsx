import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { cache } from "@/lib/cache";

import { Suspense } from "react";

import db from "@/db/db";
import { ProductDialog } from "../_components/ProductDialog";
import CarouselImage from "../_components/CarouselImage";

export default function ShopPage() {
  return (
    <>
      <div className="relative flex flex-col">
        {/* Background Carousel with Partial Visibility */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="relative w-full h-[50vh]">
            <CarouselImage usedFor="shop" />
            {/* Transparent Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 z-10 h-[40vh] flex flex-col justify-center items-center pb-8">
              <h1 className="text-5xl font-gotham text-center text-white tracking-wider p-4">
                Shop Our Collection
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-20 w-full mx-auto px-4 py-6 mt-[40vh]">
          <div className="space-y-16">
            {/* Banner text */}
            <h1 className="text-3xl font-oSans text-gray-700 m-6 tracking-wider">
              Add elegance to your home with our collection of floral arrangements.
            </h1>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 m-4">
              <Suspense
                fallback={
                  <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </>
                }
              >
                <ArrangementsSuspense />
              </Suspense>
            </div>
          </div>
          {/* Uncomment and modify the following section for plants if needed */}
          {/*
          <div className="mt-4">
            <div className="border-b border-gray-200 p-4">
              <h1 className=" text-2xl font-kuhlenbach text-center">
                Step into Our Plant Paradise
              </h1>
            </div>

            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              <Suspense
                fallback={
                  <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </>
                }
              >
                <PlantsSuspense />
              </Suspense>
            </div>
          </div>
          */}
        </div>
      </div>
    </>
  );
}

const getPlants = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "plant" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { sizes: true },
    });
  },
  ["/shop", "getPlants"],
  { revalidate: 20 }
);

const getPlantImages = cache(
  (product) => {
    return db.image.findMany({
      where: { productId: product.id },
    });
  },
  ["/shop", "getPlants"],
  { revalidate: 20 }
);

const getArrangements = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "arrangement" },
      orderBy: { createdAt: "desc" },
      include: { sizes: true },
      take: 3,
    });
  },
  ["/shop", "getArrangements"],
  { revalidate: 20 }
);

const getArrangementImages = cache(
  (product) => {
    return db.image.findMany({
      where: { productId: product.id },
    });
  },
  ["/shop", "getArrangements"],
  { revalidate: 20 }
);

async function ArrangementsSuspense() {
  const products = await getArrangements();

  const productElements = await Promise.all(
    products.map(async (product) => {
      const images = await getArrangementImages(product);

      return (
        <ProductDialog key={product.id} product={product} images={images} />
      );
    })
  );

  return <>{productElements}</>;
}

async function PlantsSuspense() {
  const products = await getPlants();

  const productElements = await Promise.all(
    products.map(async (product) => {
      const images = await getPlantImages(product);

      return (
        <ProductDialog key={product.id} product={product} images={images} />
      );
    })
  );

  return <>{productElements}</>;
}
