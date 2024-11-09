// src/app/admin/products/_components/ProductForm.tsx

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
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Product, Image as PrismaImage } from "@prisma/client";
import Image from "next/image";

interface ProductWithImages extends Product {
  images?: PrismaImage[];
}

export function ProductForm({
  product,
}: {
  product?: ProductWithImages | null;
}) {
  const [error, action] = useFormState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );

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

  useEffect(() => {
    if (product?.images) {
      setExistingImages(product.images);
    }
  }, [product]);

  const addImage = () => {
    setNewImages((prev) => [...prev, { file: null }]);
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((ids) => [...ids, id]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageList = [...newImages];
      newImageList[index] = {
        file,
        previewUrl: URL.createObjectURL(file),
      };
      setNewImages(newImageList);
    }
  };

  return (
    <form
      action={action}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={product?.name || ""}
          />
          {error.name && <div className="text-destructive">{error.name}</div>}
        </div>

        <div className="space-y-2">
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
            <div className="text-destructive">{error.priceInCents}</div>
          )}
          <div className="text-sm text-muted-foreground">
            {formatCurrency((priceInCents || 0) / 100)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description || ""}
          className="resize-none"
        />
        {error.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="careguide">How to Care</Label>
        <Textarea
          id="careguide"
          name="careguide"
          required
          defaultValue={product?.careguide || ""}
          className="resize-none"
        />
        {error.careguide && (
          <div className="text-destructive">{error.careguide}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" required defaultValue={product?.category || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="arrangement">Arrangement</SelectItem>
            <SelectItem value="plant">Plant</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>
        {error.category && (
          <div className="text-destructive">{error.category}</div>
        )}
      </div>

      {/* Main Image */}
      <div className="space-y-2">
        <Label htmlFor="image">Main Image</Label>
        <Input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          required={!product}
        />
        {product && (
          <div className="mt-4">
            <Image
              src={product.imagePath}
              height={300}
              width={300}
              alt="Product Image"
              className="rounded-md"
            />
          </div>
        )}
        {error.image && <div className="text-destructive">{error.image}</div>}
      </div>
      {/* Additional Images */}
      <div className="space-y-2">
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
                layout="fill"
                objectFit="cover"
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
              name="images[]"
              type="file"
              onChange={(e) => handleNewImageChange(e, index)}
              accept="image/*"
            />
            {img.previewUrl && (
              <div className="w-24 h-24 relative">
                <Image
                  src={img.previewUrl}
                  alt={`New Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
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
     
      {/* <div className="space-y-2">
        <Label className="text-lg font-semibold">Additional Images</Label>
        {additionalImages.map((img, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Input
              name={`images[${index}]`}
              type="file"
              onChange={(e) => handleImageChange(e, index)}
              id={`images[${index}]`}
              accept="image/*"
            />
            {img.previewUrl && (
              <div className="w-24 h-24 relative">
                <Image
                  src={img.previewUrl}
                  alt={`Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeImage(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addImage} variant="outline">
          Add more pictures...
        </Button>
      </div> */}

      {/* Hidden input to pass deleted image IDs */}
      {deletedImageIds.map((id) => (
        <input key={id} type="hidden" name="deletedImageIds[]" value={id} />
      ))}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
