// src/app/(customerFacing)/_components/FeaturedProducts.tsx

import { ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache1 } from "@/lib/cache";

import { Suspense } from "react";
import { ProductDialog } from "../_components/ProductDialog";

export default function FeaturedProducts() {
  return (
    <>
      <div className="gap-10 grid grid-cols-2 m-4 md:grid-cols-3 lg:grid-cols-3 lg:w-2/3 mx-auto">
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
          <FeaturedProductsSuspense />
        </Suspense>
      </div>
    </>
  );
}

const getFeaturedProducts = cache1(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, featuredProducts: { some: {} } },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  },
  ["/shop", "getFeaturedProducts"],
  { revalidate: 20 }
);

const getFeaturedProductImages = cache1(
  (product) => {
    return db.image.findMany({
      where: { productId: product.id },
      take: 12,
    });
  },
  ["/shop", "getFeaturedProductImages"],
  { revalidate: 20 }
);

async function FeaturedProductsSuspense() {
  const products = await getFeaturedProducts();

  const productElements = await Promise.all(
    products.map(async (product) => {
      const images = await getFeaturedProductImages(product);

      return (
        <ProductDialog key={product.id} product={product} images={images} />
      );
    })
  );

  return <>{productElements}</>;
}
