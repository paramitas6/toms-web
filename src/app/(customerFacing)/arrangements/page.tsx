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

import { ProductDialogContent } from "./_components/ProductDialogContent";

import { formatCurrency } from "@/lib/formatters";
import { ShoppingCartIcon } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProductsPage() {
  return (
    <div className="mt-4">
      {/* Banner text */}
      <div className="border-b border-gray-200 p-4">
        <h2 className=" text-3xl font-montserrat text-center">
          Discover Our Handmade Floral Arrangements
        </h2>
        <h1 className=" text-2xl  font-kuhlenbach text-center">
          {" "}
          Gift the enchantment of our arrangements, a masterpiece of floral
          elegance.
        </h1>
      </div>

      <div className="gap-4 gap-x-8 grid grid-cols-1 mt-4  md:grid-cols-2 lg:grid-cols-3">
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

const getProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true, category: "arrangement" },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  },
  ["/arrangements", "getProducts"],
  { revalidate: 20 }
);

const getProductImages = cache(
  (product) => {
    return db.image.findMany({
      where: { productId: product.id },
      take: 12,
    });
  },
  ["/arrangements", "getProducts"],
  { revalidate: 20 }
);

async function ProductsSuspense() {
  const products = await getProducts();

  const productElements = await Promise.all(
    products.map(async (product) => {
      const images = await getProductImages(product);

      return (
        <Dialog key={product.id}>
          <DialogTrigger>
            <ProductCard {...product} />
          </DialogTrigger>
          <ProductDialogContent product={product} images={images} />

        </Dialog>
      );
    })
  );

  return <>{productElements}</>;
}

// async function ProductsSuspense() {
//   const products = await getProducts();

//   return products.map((product) => (

//     <Dialog>
//       <DialogTrigger>
//         <ProductCard key={product.id} {...product} />
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[825px] h-full">
//         <DialogHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2">

//             <div className="h-[400px] sm:max-w-[400px] relative">
//               <Image src={product.imagePath} fill alt={product.name} />
//             </div>

//             <div className="p-2 space-y-2">
//               <DialogTitle className="text-center sm:text-right">
//                 {product.name}
//               </DialogTitle>
//               <DialogDescription className="text-center  sm:text-right">
//                 {formatCurrency(product.priceInCents / 100)}
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>
//         <div className="flex items-left ">
//           <div>
//             <Image
//               src={product.imagePath}
//               width={100}
//               height={100}
//               alt={product.name}
//             />
//           </div>
//           <div>
//             <Image
//               src={product.imagePath}
//               width={100}
//               height={100}
//               alt={product.name}
//             />
//           </div>
//         </div>
//         <div className="py-4">{product.description}</div>
//         <DialogFooter className="">
//           <Button className="" type="submit">
//             Add to cart <ShoppingCartIcon />{" "}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   ));
// }
