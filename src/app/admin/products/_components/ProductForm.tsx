"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { useState, useEffect } from "react";
import { submitProduct } from "../../_actions/products";
import { Textarea } from "@/components/ui/textarea";
import { Product, Image as PrismaImage, ProductVariant } from "@prisma/client";
import Image from "next/image";
import { v4 } from "uuid";

interface ProductWithImages extends Product {
  images?: PrismaImage[];
  sizes?: ProductVariant[];
}

interface ErrorType {
  [key: string]: string[] | undefined;
}

export function ProductForm({
  product,
}: {
  product?: ProductWithImages | null;
}) {
  const [error, setError] = useState<ErrorType>({});
  const [pending, setPending] = useState(false);

  const [priceInCents, setPriceInCents] = useState<number>(
    product?.priceInCents || 0
  );

  // State for existing and new images
  const [existingImages, setExistingImages] = useState<PrismaImage[]>([]);
  const [newImages, setNewImages] = useState<
    {
      file?: File | null;
      previewUrl?: string;
    }[]
  >([]);

  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // State for main image
  const [mainImage, setMainImage] = useState<{
    file?: File | null;
    previewUrl?: string;
  }>({
    file: null,
    previewUrl: product?.imagePath || undefined,
  });

  // State for product variants (sizes)
  const [variants, setVariants] = useState<
    { size: string; priceInCents: number }[]
  >(
    product?.sizes && product.sizes.length > 0
      ? product.sizes.map((variant) => ({
          size: variant.size,
          priceInCents: variant.priceInCents,
        }))
      : [{ size: "", priceInCents: 0 }]
  );

  useEffect(() => {
    if (product?.images) {
      setExistingImages(product.images);
    }
  }, [product]);

  const addImage = () => {
    setNewImages((prev) => [...prev, { file: null, previewUrl: undefined }]);
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((ids) => [...ids, id]);
  };

  const removeNewImage = (index: number) => {
    // Revoke the preview URL if it exists
    if (newImages[index].previewUrl) {
      URL.revokeObjectURL(newImages[index].previewUrl);
    }
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageList = [...newImages];
      // Revoke the previous preview URL if exists
      if (newImageList[index].previewUrl) {
        URL.revokeObjectURL(newImageList[index].previewUrl);
      }
      newImageList[index] = {
        file,
        previewUrl: URL.createObjectURL(file),
      };
      setNewImages(newImageList);
    }
  };

  // Handlers for main image
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke the previous preview URL if it exists to prevent memory leaks
      if (mainImage.previewUrl && mainImage.previewUrl !== product?.imagePath) {
        URL.revokeObjectURL(mainImage.previewUrl);
      }
      setMainImage({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  const removeMainImage = () => {
    // Revoke the preview URL if it's a new image
    if (mainImage.previewUrl && mainImage.previewUrl !== product?.imagePath) {
      URL.revokeObjectURL(mainImage.previewUrl);
    }
    setMainImage({
      file: null,
      previewUrl: product?.imagePath || undefined,
    });
  };

  // Handlers for variants
  const handleVariantChange = (
    index: number,
    field: "size" | "priceInCents",
    value: string | number
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "", priceInCents: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Determine the correct server action based on whether we're adding or updating
  const formAction = async (formData: FormData) => {
    setPending(true);
    console.log("formAction called");

    // Append the main image file if a new one is selected
    if (mainImage.file) {
      formData.append("mainImage", mainImage.file);
    }

    // Append deleted image IDs
    deletedImageIds.forEach((id) => {
      formData.append("deletedImageIds[]", id);
    });

    // Append existing image IDs
    existingImages.forEach((img) => {
      formData.append("existingImageIds[]", img.id);
    });

    // Append new images
    newImages.forEach((img, index) => {
      if (img.file) {
        formData.append(`newImages[${index}]`, img.file);
      }
    });

    // Append variants
    variants.forEach((variant, index) => {
      formData.append(`variants[${index}][size]`, variant.size);
      formData.append(
        `variants[${index}][priceInCents]`,
        variant.priceInCents.toString()
      );
    });

    // Append other form fields as needed
    // For example:
    // formData.append("name", formValues.name);
    // ...

    const errors = await submitProduct(formData);
    if (errors) {
      setError(errors);
      console.log("errors", errors);
    } else {
      setError({});
      console.log("no errors");
    }
    setPending(false);
  };

  useEffect(() => {
    return () => {
      // Revoke the main image preview URL if it's a new image
      if (mainImage.previewUrl && mainImage.previewUrl !== product?.imagePath) {
        URL.revokeObjectURL(mainImage.previewUrl);
      }

      // Revoke all new image preview URLs
      newImages.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [mainImage, newImages, product]);

  return (
    <form action={formAction}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2 w-full md:w-1/2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={product?.name || ""}
          />
          {error.name && (
            <div className="text-destructive">{error.name.join(", ")}</div>
          )}
        </div>

        <div className="space-y-2 w-full md:w-1/2">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            required
            defaultValue={product?.category || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arrangement">Bouquet</SelectItem>
              <SelectItem value="vase arrangement">Vase Arrangement</SelectItem>
              <SelectItem value="plant">Plant</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
          {error.category && (
            <div className="text-destructive">{error.category.join(", ")}</div>
          )}
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="priceInCents">Price (in cents)</Label>
          <Input
            type="number"
            id="priceInCents"
            name="priceInCents"
            required
            value={priceInCents}
            onChange={(e) => setPriceInCents(Number(e.target.value) || 0)}
          />
          {error.priceInCents && (
            <div className="text-destructive">
              {error.priceInCents.join(", ")}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {formatCurrency((priceInCents || 0) / 100)}
          </div>
        </div> */}
      </div>

      {/* Sizes (Variants) */}
      <div className="space-y-2 py-4 flex flex-col gap-4">
        {variants.map((variant, index) => (
          <div
            key={`variant-${index}`}
            className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 "
          >
            <div className="flex flex-col w-full">
              <Label htmlFor={`variants[${index}][size]`}>Size</Label>
              <Input
                type="text"
                id={`variants[${index}][size]`}
                name={`variants[${index}][size]`}
                required
                value={variant.size}
                onChange={(e) =>
                  handleVariantChange(index, "size", e.target.value)
                }
              />
              {error[`variants.${index}.size`] && (
                <div className="text-destructive">
                  {error[`variants.${index}.size`]?.join(", ")}
                </div>
              )}
            </div>
            <div className="flex gap-4 w-2/3">
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <Label htmlFor={`variants[${index}][priceInCents]`}>
                    Price (in cents)
                  </Label>
                  <Label className="text-muted-foreground">
                    {formatCurrency((variant.priceInCents || 0) / 100)}
                  </Label>
                </div>
                <Input
                  type="number"
                  id={`variants[${index}][priceInCents]`}
                  name={`variants[${index}][priceInCents]`}
                  required
                  value={variant.priceInCents}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "priceInCents",
                      Number(e.target.value) || 0
                    )
                  }
                />
                {error[`variants.${index}.priceInCents`] && (
                  <div className="text-destructive">
                    {error[`variants.${index}.priceInCents`]?.join(", ")}
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length === 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" onClick={addVariant} variant="outline" className="bg-red-50 w-full mx-auto md:w-1/4">
          Add Size
        </Button>
      </div>
      <hr className="m-4"/>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2 w-full md:w-1/2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={product?.description || ""}
            className="resize-none"
          />
          {error.description && (
            <div className="text-destructive">
              {error.description.join(", ")}
            </div>
          )}

        </div>
        

        <div className="space-y-2 w-full md:w-1/2">          <Label htmlFor="careguide">How to Care</Label>
          <Textarea
            id="careguide"
            name="careguide"
            required
            defaultValue={product?.careguide || ""}
            className="resize-none"
          />
          {error.careguide && (
            <div className="text-destructive">{error.careguide.join(", ")}</div>
          )}</div>
      </div>
      
      {/* Main Image */}
      <div className="space-y-2 py-4">
        <Label htmlFor="image">Main Image</Label>
        <Input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          required={!product}
          onChange={handleMainImageChange}
        />
        {mainImage.previewUrl && (
          <div className="mt-4 flex items-center space-x-4">
            <div className="w-24 h-24 relative">
              <Image
                src={mainImage.previewUrl}
                alt="Main Product Image"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={removeMainImage}
            >
              Remove
            </Button>
          </div>
        )}
        {error.image && (
          <div className="text-destructive">{error.image.join(", ")}</div>
        )}
      </div>

      {/* Additional Images */}
      <div className="space-y-2 py-4">
        <Label className="text-lg font-semibold">Additional Images</Label>

        {/* Existing Images */}
        {existingImages.map((img, index) => (
          <div
            key={`existing-${img.id}`}
            className="flex items-center space-x-4"
          >
            {/* Hidden input to pass existing image IDs */}
            <input type="hidden" name="existingImageIds[]" value={img.id} />
            <div className="w-24 h-24 relative">
              <Image
                src={img.imagePath}
                alt={`Image ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeExistingImage(img.id)}
            >
              Remove
            </Button>
          </div>
        ))}

        {/* New Images */}
        {newImages.map((img, index) => (
          <div key={`new-${index}`} className="flex items-center space-x-4">
            <Input
              name={`newImages[]`}
              type="file"
              onChange={(e) => handleNewImageChange(e, index)}
              accept="image/*"
            />
            {img.previewUrl && (
              <div className="w-24 h-24 relative">
                <Image
                  src={img.previewUrl}
                  alt={`New Image ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeNewImage(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addImage} variant="outline">
          Add more pictures...
        </Button>
      </div>

      {/* Hidden input to pass deleted image IDs */}
      {deletedImageIds.map((id) => (
        <input key={id} type="hidden" name="deletedImageIds[]" value={id} />
      ))}

      {/* General error message */}
      {error.general && (
        <div className="text-destructive">{error.general.join(", ")}</div>
      )}

      <SubmitButton pending={pending} />
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
