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
import { ProductType, ImageType } from "@/types/types";

interface ProductDialogProps {
  product: ProductType;
  images: ImageType[];
}

export function ProductDialog({ product, images }: ProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <ProductCard {...product} />
      </DialogTrigger>

        <ProductDialogContent
          product={product}
          images={images}
          onClose={handleClose}
        />
 
    </Dialog>
  );
}
