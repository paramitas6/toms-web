// src/_components/ProductDialog.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/ProductCard";
import { ProductDialogContent } from "./ProductDialogContent";

// Import the types
import { Product, Image, ProductVariant } from "@prisma/client";

interface ProductDialogProps {
  product: Product & { sizes: ProductVariant[] }; // Ensure sizes are included
  images: Image[];
}

export function ProductDialog({ product, images }: ProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button>
          <ProductCard
            id={product.id}
            name={product.name}
            description={product.description}
            imagePath={product.imagePath}
            sizes={product.sizes}
          />
        </button>
      </DialogTrigger>

      <ProductDialogContent
        product={product}
        images={images}
        variants={product.sizes}
        onClose={handleClose}
      />
    </Dialog>
  );
}
