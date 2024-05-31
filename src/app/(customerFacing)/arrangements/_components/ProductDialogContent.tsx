"use client";

import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // import necessary components
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useState, useRef } from "react";

export function ProductDialogContent({
  product,
  images,
}: {
  product: any;
  images: any;
}) {
  //Main image needs to be changed when smaller thumbnail is clicked
  const [mainImage, setMainImage] = useState(product.imagePath);

  const [selectedSize, setSelectedSize] = useState("");

  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
  };

  return (
    <DialogContent className="sm:max-w-[80%] h-full overflow-auto font-montserrat content-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 ">
        <div className="flex flex-col pr-4">
          <div className="w-full h-auto sm:w-full aspect-square relative flex-shrink">
            <Image
              className="object-contain sm:object-top w-full "
              src={mainImage}
              fill
              alt={product.name}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onClick={() => {
                window.open(mainImage, "_blank");
              }}
            />
          </div>

          <div className="flex  flex-row">
            <div className="h-[100px] w-[100vw] relative m-1">
              <Image
                src={product.imagePath}
                className="object-contain "
                fill
                alt={product.name}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onClick={() => setMainImage(product.imagePath)}
              />
            </div>
            {images.map((image: any) => (
              <div className="h-[100px] w-[100vw] relative m-1">
                <Image
                  src={image.imagePath}
                  className="object-contain "
                  fill
                  alt={product.name}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onClick={() => setMainImage(image.imagePath)}
                />
              </div>
            ))}
          </div>
          <div></div>
        </div>

        <div className="p-2 space-y-2 flex flex-col pl-4">
          <DialogTitle className="text-center sm:text-right text-4xl">
            {product.name}
          </DialogTitle>

          <DialogDescription className="text-center  sm:text-right">
            {formatCurrency(product.priceInCents / 100)}
          </DialogDescription>

          <div className="my-4 border-b"></div>

          



          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl">Description</h1>
            {product.description}
          </div>
          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl">How to care</h1>
            {product.description}
          </div>

                    {/*Size dialog div */}

                    <div className="m-4 flex-shrink py-2 flex-row">
            <h1 className="font text-xl pb-2">Size</h1>

            <div className="flex flex-row">
              <Button
                variant="ghost"
                className={`p2 w-full rounded-none ${
                  selectedSize === "standard" ? "bg-gray-100" : ""
                }`}
                type="submit"
                onClick={() => handleSizeSelection("standard")}
              >
                Standard
              </Button>
              <Button
                variant="ghost"
                className={`p2 w-full rounded-none ${
                  selectedSize === "deluxe" ? "bg-gray-100" : ""
                }`}
                type="submit"
                onClick={() => handleSizeSelection("deluxe")}
              >
                Deluxe
              </Button>
              <Button
                variant="ghost"
                className={`p2 w-full rounded-none ${
                  selectedSize === "premium" ? "bg-gray-100" : ""
                }`}
                type="submit"
                onClick={() => handleSizeSelection("premium")}
              >
                Premium
              </Button>
            </div>
          </div>

          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl pb-2">Write a message</h1>
            <Textarea
              className="w-full rounded-none"
              autoFocus={false}
              placeholder="A meaningful message for your loved one."
            />
          </div>



          <div className="text-center sm:text-right">
            <Button className="p2 w-full rounded-none" type="submit">
              <ShoppingCartIcon />
              <span className="mr-3"></span>Add to cart
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
