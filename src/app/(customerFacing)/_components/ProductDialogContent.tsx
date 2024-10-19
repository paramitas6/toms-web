"use client";

import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; 
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { useState, useContext } from "react";
import CartContext from "../_components/CartComponent"; // Import the CartContext

export function ProductDialogContent({
  product,
  images,
}: {
  product: any;
  images: any;
}) {
  const [mainImage, setMainImage] = useState(product.imagePath);
  const [selectedSize, setSelectedSize] = useState("");
  const { addItemToCart } = useContext(CartContext); // Access Cart Context

  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }

    // Create the cart item to add
    const cartItem = {
      productId: product.id,
      name: `${product.name} (${selectedSize})`, // Including size in the name for clarity
      priceInCents: product.priceInCents, // Assuming price is same across sizes
      image: mainImage, // Use the currently selected main image
      quantity: 1, // Default to 1 for now
    };

    addItemToCart(cartItem); // Add to cart context

    alert("Added to cart successfully!");
  };

  return (
    <DialogContent className="sm:max-w-[80%] h-full font-montserrat overflow-auto ">
      <div className="grid grid-cols-1 sm:grid-cols-2 pt-5">
        <div className="flex flex-col pr-4 ">
          <div className="w-full h-auto sm:w-full aspect-square group relative flex-shrink">
            <Image
              className="object-cover sm:object-center w-full "
              src={mainImage}
              fill
              alt={product.name}
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
            {images.map((image: any, index: number) => (
              <div key={index} className="h-[100px] w-[100vw] relative m-1">
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
        </div>

        <div className="p-2 space-y-2 flex flex-col pl-4 ">
          <div className="flex flex-col justify-between items-left mt-4 p-1 font-montserrat">
            <DialogTitle className="text-center sm:text-right text-4xl">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-center  sm:text-right">
              {formatCurrency(product.priceInCents / 100)}
            </DialogDescription>
          </div>

          <div className="my-4 border-b"></div>

          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl">Description</h1>
            {product.description}
          </div>
          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl">How to care</h1>
            {product.careguide}
          </div>

          {/* Size dialog div */}
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
            <Button className="p2 w-full rounded-none" type="submit" onClick={handleAddToCart}>
              <ShoppingCartIcon />
              <span className="mr-3"></span>Add to cart
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
