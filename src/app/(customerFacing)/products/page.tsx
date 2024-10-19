import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";

import { Suspense } from "react";


export default function ProductsPage() {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Placeholder product cards for testing */}
        <div className="bg-gray-300 p-4">Product 1</div>
        <div className="bg-gray-300 p-4">Product 2</div>
        <div className="bg-gray-300 p-4">Product 3</div>
        <div className="bg-gray-300 p-4">Product 4</div>
        <div className="bg-gray-300 p-4">Product 5</div>
        <div className="bg-gray-300 p-4">Product 6</div>
      </div>
    </div>
  );
}
export function Produ1ctsPage() {
  return (
  
    <div className="mt-4">
      {/* BAnnder */}
      <div>
      
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
