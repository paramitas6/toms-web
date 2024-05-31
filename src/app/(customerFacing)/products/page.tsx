import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";

import { Suspense } from "react";

export default function ProductsPage() {
  return (
  
    <div className="mt-4">
      {/* BAnnder */}
      <div>
      
      </div>
      <div className="gap-4 gap-x-8 grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 ">
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
          <ProductsSuspense />
        </Suspense>

      </div>
    </div>
  );
}

const getProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true,category:"flower" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
}, ["/products", "getProducts"]);

async function ProductsSuspense() {
  const products = await getProducts();

  return products.map((product) => (
    <ProductCard key={product.id} {...product} />

  ));
}
