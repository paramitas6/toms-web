// src\app\(customerFacing)\shop\page.tsx 

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";

import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ProductDialogContent } from "../_components/ProductDialogContent";
import { ProductDialog } from "../_components/ProductDialog";

import { formatCurrency } from "@/lib/formatters";
import { ShoppingCartIcon } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      {/* <div className="mt-4">
        
        <div className="border-b border-gray-200 p-4">
          <h1 className=" text-2xl  font-kuhlenbach text-center">
            Step into Our Plant Paradise
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
      </div> */}
      
    </>
  );
}

const getPlants = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "plant" },
      orderBy: { createdAt: "desc" },
      take: 12,
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

const getArrangements = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "arrangement" },
      orderBy: { createdAt: "desc" },
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
