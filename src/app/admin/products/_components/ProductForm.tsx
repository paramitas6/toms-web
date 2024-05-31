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
import { useState } from "react";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@prisma/client";
import Image from "next/image";

interface Image {
  id: number;
}

export function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useFormState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );

  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents||0
  );


  const [images, setImages] = useState<(File | null)[]>([]);

  const addImage = () => {
    setImages(prev => [...prev, null]);
    console.log(images)
  }
    
  const removeImage = (index:number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const formData = new FormData();
  images.forEach((image,i) => {
    if (image) {
      formData.append(`images[${i}]`, image); 
    }
  });





  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
      
    }
  }

  return (
    <form action={action} className="space-y-8">
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description || ""}
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
        />
        {error.careguide && (
          <div className="text-destructive">{error.careguide}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category">
          <SelectTrigger>
            <SelectValue placeholder="Please choose...." />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="arrangement">Arrangement</SelectItem>
            <SelectItem value="flower">Flower</SelectItem>
            <SelectItem value="subscription">Subcription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required={product == null} />
        {product != null && (
          <Image
            src={product.imagePath}
            height="400"
            width="400"
            alt="Product Image"
          />
        )}
        {error.image && <div className="text-destructive">{error.image}</div>}
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          {images.map((img, index) => (
            <div key={index}>
              <Input
                name={`images[${index}]`}
                type="file"
                onChange={(e) => handleImageChange(e, index)}

                id={`images[${index}]`}
                accept="image/*"
                
              />

              <Button type="button" onClick={() => removeImage(index)}>
                Remove
              </Button>
            </div>
          ))}

          <Button type="button" onClick={addImage}>
            Add more pictures...
          </Button>
        </div>


      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input type="file" id="file" name="file" required={product == null} />
        {product != null && (
          <div className="text-muted-foreground">{product.filePath}</div>
        )}
        {error.file && <div className="text-destructive">{error.file}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price(in cents)</Label>
        <Input
          type="text"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value) || 0)}
        />
        {error.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
      </div>

      <div className="text-muted-foreground">
        {formatCurrency((priceInCents || 0) / 100)}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
