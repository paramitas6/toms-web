// src/app/admin/_actions/products.ts

"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

const addSchema = z.object({
  name: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  description: z.string().min(1),
  careguide: z.string().min(1),
  category: z.string().min(1),
  image: imageSchema,
  images: imagesSchema,
  stock: z.coerce.number().int().min(0).default(0),
});

export async function addProduct(prevState: unknown, formdata: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  // Fetch data from form submission
  const data = result.data;

  // Make image path
  await fs.mkdir("public/products", { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(
    `public${imagePath}`,
    new Uint8Array(await data.image.arrayBuffer())
  );

  // Get additional image entries
  const imageEntries = Array.from(formdata.entries()).filter((entry) =>
    entry[0].startsWith("images[")
  );

  // Map to Files
  const images = imageEntries.map((entry) => entry[1] as File);

  // Create the product in the database
  const product = await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      category: data.category,
      description: data.description,
      careguide: data.careguide,
      priceInCents: data.priceInCents,
      imagePath,
      stock: data.stock,
    },
  });

  // Save additional images
  for (const image of images) {
    const imageFilePath = `/products/${crypto.randomUUID()}-${image.name}`;
    await fs.writeFile(
      `public${imageFilePath}`,
      new Uint8Array(await image.arrayBuffer())
    );

    await db.image.create({
      data: {
        imagePath: imageFilePath,
        productId: product.id,
      },
    });
  }

  // Revalidate paths and redirect
  revalidatePath("/");
  revalidatePath("/shop")
  redirect("/admin/products");
}

const editSchema = z.object({
  name: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  description: z.string().min(1),
  careguide: z.string().min(1),
  category: z.string().min(1),
  stock: z.coerce.number().int().min(0).default(0),
  image: imageSchema.optional(),
  images: imagesSchema.optional(),
  deletedImageIds: z.array(z.string()).optional(),
});

export async function updateProduct1(
  id: string,
  prevState: unknown,
  formdata: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const product = await db.product.findUnique({
    where: { id },
    include: { images: true }, // Include existing images
  });
  if (product == null) {
    return notFound();
  }

  // Handle main image
  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    // Delete old image file
    await fs.unlink(`public${imagePath}`);
    // Save new image
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      new Uint8Array(await data.image.arrayBuffer())
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
      priceInCents: data.priceInCents,
      imagePath,
      stock: data.stock,
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
  // Get new image entries
  const imageEntries = Array.from(formdata.entries()).filter((entry) =>
    entry[0].startsWith("images[")
  );

  // Map to Files
  const images = imageEntries.map((entry) => entry[1] as File);

  if (images && images.length > 0) {
    // Save additional images
    for (const image of images) {
      if (image.size > 0) {
        const imageFilePath = `/products/${crypto.randomUUID()}-${image.name}`;
        await fs.writeFile(
          `public${imageFilePath}`,
          new Uint8Array(await image.arrayBuffer())
        );

        await db.image.create({
          data: {
            imagePath: imageFilePath,
            productId: id,
          },
        });
      }
    }
  }

  // Revalidate paths and redirect
  revalidatePath("/");
  revalidatePath("/shop")
  redirect("/admin/products");
}

// Fetch all products as a server action
export async function fetchProducts() {
  return await db.product.findMany({
    include: {
      featuredProducts: true,
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
  revalidatePath("/shop")
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

  revalidatePath("/");
  revalidatePath("/shop")
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
export async function updateProduct(
  id: string,
  prevState: unknown,
  formdata: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const product = await db.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (product == null) {
    return notFound();
  }

  // Handle main image
  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    // Delete old image file
    await fs.unlink(`public${imagePath}`);
    // Save new image
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      new Uint8Array(await data.image.arrayBuffer())
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
      priceInCents: data.priceInCents,
      imagePath,
      stock: data.stock,
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
  // Get new image entries
  const imageEntries = Array.from(formdata.entries()).filter(
    (entry) => entry[0] === "images[]"
  );

  // Map to Files and filter out empty files
  const images = imageEntries
    .map((entry) => entry[1] as File)
    .filter((file) => file.size > 0);

  if (images && images.length > 0) {
    // Save additional images
    for (const image of images) {
      const imageFilePath = `/products/${crypto.randomUUID()}-${image.name}`;
      await fs.writeFile(
        `public${imageFilePath}`,
        new Uint8Array(await image.arrayBuffer())
      );

      await db.image.create({
        data: {
          imagePath: imageFilePath,
          productId: id,
        },
      });
    }
  }

  // Revalidate paths and redirect
  revalidatePath("/shop")
  revalidatePath("/");
  redirect("/admin/products");
}