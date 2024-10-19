import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import Image from "next/image";

import homeimage from "/public/image3.webp";

const getNewestProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}, ["/", "getNewestProducts"]);

// const getPopularProducts = cache(
//   () => {
//     return db.product.findMany({
//       where: { isAvailableForPurchase: true },
//       orderBy: { orders: { _count: "desc" } },
//       take: 6,
//     });
//   },
//   ["/", "getMostPopularProducts"],
//   { revalidate: 60 * 60 }
// );

//main homescreen
export default function HomePage() {
  return (
    <main className="space-y-4">
      <div className="bg-blend-color-dodge bg-black  justify-center items-center">
        <div className="flex flex-col items-center w-full">
          <Image src={homeimage} width={3000} alt="home" />

          <h1>New arrivals</h1>
        </div>
      </div>
      {/* <ProductGridSection title="Most popular" productsFetcher={getPopularProducts} />
        <ProductGridSection title="Newest" productsFetcher={getNewestProducts} /> */}
    </main>
  );
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<Product[]>;
};
function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products" className="space-x-2">
            <span>View all</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>;
}) {
  return (await productsFetcher()).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
