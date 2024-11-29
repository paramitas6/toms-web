// src/app/admin/_actions/products.ts

"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Define schemas
const imageSchema = z
  .instanceof(File)
  .refine(
    (file) => {
      if (file.size === 0) return true; // Allow empty files
      return file.type.startsWith("image/");
    },
    "Invalid image"
  );

const imagesSchema = z.array(imageSchema).optional();

// Variant schema
const variantSchema = z.object({
  size: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
});

const variantsSchema = z.array(variantSchema).min(1, "At least one variant is required");

// Unified submit product schema
const submitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  careguide: z.string().min(1),
  category: z.string().min(1),
  image: imageSchema.optional(),
  newImages: imagesSchema.optional(),
  deletedImageIds: z.array(z.string()).optional(),
  variants: variantsSchema,
});

// Helper function to parse variants from FormData


export async function submitProduct(formdata: FormData) {
  const id = formdata.get("id") as string | null;

  // Parse and validate form data
  const result = submitSchema.safeParse({
    ...Object.fromEntries(formdata.entries()),
    variants: parseVariants(formdata),
  });

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  if (id) {
    // Update existing product
    return await updateProduct(id, data, formdata);
  } else {
    // Add new product
    return await addProduct(data, formdata);
  }
}

async function addProduct(data: z.infer<typeof submitSchema>, formdata: FormData) {
  // Handle main image
  await fs.mkdir("public/products", { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image?.name || "default.jpg"}`;
  if (data.image && data.image.size > 0) {
    await fs.writeFile(
      `public${imagePath}`,
      new Uint8Array(await data.image.arrayBuffer())
    );
  }

  // Handle additional images
  const newImages = formdata.getAll("newImages[]") as File[];
  const additionalImages = [];
  for (const image of newImages) {
    if (image.size > 0) {
      const imageFilePath = `/products/${crypto.randomUUID()}-${image.name}`;
      await fs.writeFile(
        `public${imageFilePath}`,
        new Uint8Array(await image.arrayBuffer())
      );
      additionalImages.push(imageFilePath);
    }
  }

  // Create product
  const product = await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      category: data.category,
      description: data.description,
      careguide: data.careguide,
      imagePath,
    },
  });

  // Save additional images to the database
  for (const imagePath of additionalImages) {
    await db.image.create({
      data: {
        imagePath,
        productId: product.id,
      },
    });
  }

  // Save variants
  for (const variant of data.variants) {
    await db.productVariant.create({
      data: {
        size: variant.size,
        priceInCents: variant.priceInCents,
        productId: product.id,
      },
    });
  }

  // Revalidate paths and redirect
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/products");
}

async function updateProduct(
  id: string,
  data: z.infer<typeof submitSchema>,
  formdata: FormData
) {
  const product = await db.product.findUnique({
    where: { id },
    include: { images: true, sizes: true },
  });

  if (product == null) {
    return notFound();
  }

  // Handle main image
  let imagePath = product.imagePath;
  const newMainImage = formdata.get("image") as File | null;
  if (newMainImage && newMainImage.size > 0) {
    // Delete old image file
    await fs.unlink(`public${imagePath}`);
    // Save new image
    imagePath = `/products/${crypto.randomUUID()}-${newMainImage.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      new Uint8Array(await newMainImage.arrayBuffer())
    );
  }

  // Update the product in the database
  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      careguide: data.careguide,
      category: data.category,
      imagePath,
    },
  });

  // Handle deleted images
  const deletedImageIds = formdata.getAll("deletedImageIds[]") as string[];
  for (const imageId of deletedImageIds) {
    const image = await db.image.findUnique({ where: { id: imageId } });
    if (image) {
      await fs.unlink(`public${image.imagePath}`);
      await db.image.delete({ where: { id: imageId } });
    }
  }

  // Handle new additional images
  const newImages = formdata.getAll("newImages[]") as File[];
  const additionalImages = [];
  for (const image of newImages) {
    if (image.size > 0) {
      const imageFilePath = `/products/${crypto.randomUUID()}-${image.name}`;
      await fs.writeFile(
        `public${imageFilePath}`,
        new Uint8Array(await image.arrayBuffer())
      );
      additionalImages.push(imageFilePath);
    }
  }

  // Save new additional images to the database
  for (const imagePath of additionalImages) {
    await db.image.create({
      data: {
        imagePath,
        productId: id,
      },
    });
  }

  // Handle variants
  if (data.variants) {
    // Delete existing variants
    await db.productVariant.deleteMany({
      where: { productId: id },
    });

    // Create new variants
    for (const variant of data.variants) {
      await db.productVariant.create({
        data: {
          size: variant.size,
          priceInCents: variant.priceInCents,
          productId: id,
        },
      });
    }
  }

  // Revalidate paths and redirect
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

// Edit product schema
const editSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  careguide: z.string().min(1),
  category: z.string().min(1),
  stock: z.coerce.number().int().min(0).default(0),
  image: imageSchema.optional(),
  images: imagesSchema.optional(),
  deletedImageIds: z.array(z.string()).optional(),
  variants: variantsSchema.optional(),
});

// Helper function to parse variants from FormData without using for...of
function parseVariants(formdata: FormData): { size: string; priceInCents: number }[] {
  const variants: { size: string; priceInCents: number }[] = [];
  const variantRegex = /^variants\[(\d+)\]\[(size|priceInCents)\]$/;

  const temp: { [key: string]: any } = {};

  const entries = formdata.entries();
  let entry = entries.next();
  while (!entry.done) {
    const [key, value] = entry.value;
    const match = key.match(variantRegex);
    if (match) {
      const index = match[1];
      const field = match[2];
      if (!temp[index]) temp[index] = {};
      temp[index][field] = field === "priceInCents" ? Number(value) : value;
    }
    entry = entries.next();
  }

  for (const index in temp) {
    if (temp.hasOwnProperty(index)) {
      const variant = temp[index];
      if (variant.size && variant.priceInCents) {
        variants.push({
          size: variant.size,
          priceInCents: variant.priceInCents,
        });
      }
    }
  }

  return variants;
}

// Fetch all products as a server action
export async function fetchProducts() {
  return await db.product.findMany({
    include: {
      featuredProducts: true,
      sizes: true,
      images: true,
    },
  });
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({
    where: {
      id,
    },
    include: {
      images: true,
      featuredProducts: true,
      sizes: true,
    },
  });

  if (product == null) {
    return notFound();
  }

  // Delete the main image
  await fs.unlink(`public${product.imagePath}`);

  // Delete additional images
  for (const image of product.images) {
    await fs.unlink(`public${image.imagePath}`);
    await db.image.delete({
      where: { id: image.id },
    });
  }

  // Delete featured products
  for (const featured of product.featuredProducts) {
    await db.featuredProduct.delete({
      where: { id: featured.id },
    });
  }

  // Delete variants
  for (const variant of product.sizes) {
    await db.productVariant.delete({
      where: { id: variant.id },
    });
  }

  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function addFeaturedProduct(id: string) {
  const existing = await db.featuredProduct.findFirst({
    where: { productId: id },
  });

  if (!existing) {
    await db.featuredProduct.create({
      data: {
        productId: id,
      },
    });
  }

  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function removeFeaturedProduct(id: string) {
  const featured = await db.featuredProduct.findFirst({
    where: { productId: id },
  });

  if (featured) {
    await db.featuredProduct.delete({
      where: { id: featured.id },
    });
  }

  revalidatePath("/shop");
  redirect("/admin/products");
}
