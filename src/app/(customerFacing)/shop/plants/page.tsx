// src\app\(customerFacing)\shop\page.tsx 

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";

import { Suspense } from "react";


import { ProductDialog } from "../../_components/ProductDialog";

export default function ShopPage() {
  return (
    <>
      <div className="mt-4">
        
        <div className="border-b border-gray-200 p-4">
        <h1 className="text-5xl text-center font-oSans text-gray-700 m-4 tracking-wider">
            Step into our plant paradise
          </h1>
        </div>

        <div className="gap-4 gap-x-8 grid grid-cols-2 mt-4 lg:grid-cols-3">
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
      
    </>
  );
}

const getPlants = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "plant" },
      orderBy: { createdAt: "desc" },
      take: 12,
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
      take: 12,
      
    });
  },
  ["/shop", "getPlants"],
  { revalidate: 20 }
);

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
