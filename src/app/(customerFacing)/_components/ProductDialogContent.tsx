// src/_components/ProductDialogContent.tsx

"use client";

import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCartIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

import { useState, useContext } from "react";
import CartContext from "../_components/CartComponent";
import { ToastAction } from "@/components/ui/toast";

import { useToast } from "@/hooks/use-toast";
import { ProductType, ImageType } from "@/types/types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { v4 as uuidv4 } from "uuid";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

interface ProductDialogContentProps {
  product: ProductType;
  images: ImageType[];
  onClose: () => void;
}

// Define a constant for the maximum number of characters allowed
const MAX_CARD_MESSAGE_LENGTH = 100;

export function ProductDialogContent({
  product,
  images,
  onClose,
}: ProductDialogContentProps) {
  const [mainImage, setMainImage] = useState(product.imagePath);
  const { addItemToCart } = useContext(CartContext);
  const toast = useToast();
  const [cardMessage, setCardMessage] = useState("");

  const handleAddToCart = () => {
    // Ensure the cardMessage does not exceed the maximum length
    const trimmedMessage = cardMessage.slice(0, MAX_CARD_MESSAGE_LENGTH);

    // Create the cart item to add
    const cartItem = {
      id: uuidv4(), // Generate unique ID
      productId: product.id,
      name: product.name,
      priceInCents: product.priceInCents,
      image: mainImage,
      quantity: 1,
      cardMessage: trimmedMessage,
    };

    addItemToCart(cartItem);

    // Show toast notification
    toast.toast({
      title: "Item added to cart!",
      description: "You can view your cart in the sidebar.",
      variant: "success",
      action: (
        <ToastAction altText="Go to basket" className="border-none">
          <Link  href="/cart">
            <ShoppingBag className="" />
          </Link>
        </ToastAction>
      ),
    });
    onClose();
  };

  // Handle changes in the Textarea with character limit
  const handleCardMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value.length <= MAX_CARD_MESSAGE_LENGTH) {
      setCardMessage(e.target.value);
    } else {
      // Optionally, you can provide feedback or ignore extra characters
      setCardMessage(e.target.value.slice(0, MAX_CARD_MESSAGE_LENGTH));
    }
  };

  return (
    <DialogContent className="sm:max-w-[80%] h-full font-montserrat overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 pt-5">
        <div className="flex flex-col items-center md:pr-4">
          <div className="w-full h-auto sm:w-full aspect-square group relative flex-shrink">
            <Image
              className="object-cover sm:object-center w-full"
              src={mainImage}
              fill
              alt={product.name}
              onClick={() => {
                window.open(mainImage, "_blank");
              }}
            />
          </div>

          <div className="mt-4 w-full items-center flex justify-center">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full max-w-[90%] "
            >
              <CarouselContent className="flex flex-nowrap -ml-1 items-center justify-center gap-2">
                <CarouselItem className="flex-shrink-0 w-32 h-32 relative cursor-pointer basis-1/3 md:basis-1/3 lg:basis-1/5 pl-2">
                  <Image
                    src={product.imagePath}
                    className="object-contain"
                    fill
                    alt={product.name}
                    sizes="75px"
                    onClick={() => setMainImage(product.imagePath)}
                  />
                </CarouselItem>
                {images.map((image: ImageType, index: number) => (
                  <CarouselItem
                    key={index}
                    className="flex-shrink-0 w-32 h-32 relative cursor-pointer basis-1/3 md:basis-1/3 lg:basis-1/5 pl-2"
                  >
                    <Image
                      src={image.imagePath}
                      className="object-contain"
                      fill
                      alt={`${product.name} - ${index + 1}`}
                      sizes="75px"
                      onClick={() => setMainImage(image.imagePath)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10">
                &#8249;
              </CarouselPrevious>
              <CarouselNext className="hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 z-10">
                &#8250;
              </CarouselNext>
            </Carousel>
          </div>
        </div>

        <div className="p-2 space-y-2 flex flex-col pl-4">
          <div className="flex flex-col justify-between items-left mt-4 p-1 font-montserrat">
            <DialogTitle className="text-center sm:text-right text-4xl text-gray-800">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-center sm:text-right">
              {formatCurrency(product.priceInCents / 100)}
            </DialogDescription>
          </div>

          <div className="my-4 border-b"></div>

          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl">Description</h1>
            <p>{product.description}</p>
          </div>
          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl">How to care</h1>
            <p>{product.careguide}</p>
          </div>

          <div className="m-4 flex-shrink py-2">
            <h1 className="font text-xl pb-2">Message</h1>
            <Textarea
              className="w-full h-[150px] rounded-none textarea-placeholder"
              autoFocus={false}
              placeholder={`Dear me,\n\nGood job finding this. You are doing great!\n\nLove, Me`}
              value={cardMessage}
              onChange={handleCardMessageChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              {cardMessage.length}/{MAX_CARD_MESSAGE_LENGTH} characters
            </p>
          </div>

          <div className="text-center sm:text-right">
            <Button
              className="p-2 w-full rounded-none flex items-center justify-center bg-gray-800"
              type="button"
              onClick={handleAddToCart}
              disabled={cardMessage.length > MAX_CARD_MESSAGE_LENGTH}
            >
              <ShoppingCartIcon className="mr-2" />
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
