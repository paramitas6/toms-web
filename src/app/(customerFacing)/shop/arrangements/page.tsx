// src\app\(customerFacing)\shop\arrangement\page.tsx

import {  ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";

import { Suspense } from "react";

import { ProductDialog } from "../../_components/ProductDialog";

export default function ShopPage() {
  return (
    <>
      <div className="mt-4">
        {/* Banner text */}
        <div className="border-b border-gray-200 p-4">
        <h1 className="text-5xl text-center font-oSans text-gray-700 m-4 tracking-wider">
            A collection of floral enchantments
          </h1>
        </div>

        <div className="gap-4 gap-x-4 grid grid-cols-2 m-4  md:grid-cols-2 lg:grid-cols-3">
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
      
    </>
  );
}

const getArrangements = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "arrangement" },
      orderBy: { createdAt: "desc" },
      include: { sizes: true },
      take: 12,
    });
  },
  ["/shop", "getArrangements"],
  { revalidate: 20 }
);

const getArrangementImages = cache(
  (product) => {
    return db.image.findMany({
      where: { productId: product.id },
      take: 12,
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

