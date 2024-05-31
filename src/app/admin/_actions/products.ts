"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "File is required" });

const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/"),
  "required"
);

const imagesSchema = z.array(imageSchema).optional();

const addSchema = z.object({
  name: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  description: z.string().min(1),
  careguide: z.string().min(1),
  category: z.string(),
  file: fileSchema.refine((file) => file.size > 0, "required"),
  image: imageSchema.refine((file) => file.size > 0, "required"),
  images: imagesSchema,
});

export async function addProduct(prevState: unknown, formdata: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  //fetch data from form submission
  const data = result.data;

  //make file path
  await fs.mkdir("products", { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  //make image path
  await fs.mkdir("public/products", { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  // Get image entries
  const imageEntries = Array.from(formdata.entries()).filter((entry) =>
    entry[0].startsWith("images[")
  );

  // Map to Files
  const images = imageEntries.map((entry) => entry[1] as File);
  console.log(JSON.stringify(images));

  const product = await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      category: data.category,
      description: data.description,
      careguide: data.careguide,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  images.forEach(async (image) => {
    await fs.mkdir("public/products", { recursive: true });

    const imageFilePath = `/products/${crypto.randomUUID()}-${image.name}`;

    await fs.writeFile(
      `public${imageFilePath}`,
      Buffer.from(await image.arrayBuffer())
    );

    await db.image.create({
      data: {
        imagePath: imageFilePath,
        productId: product.id,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/arrangements");
  revalidatePath("/flowers");
  revalidatePath("/products");
  redirect("/admin/products");
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
  images: imagesSchema.optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formdata: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formdata.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({
    where: { id },
  });
  if (product == null) {
    return notFound();
  }

  let filePath = product.filePath;
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(filePath);
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${imagePath}`);
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      careguide: data.careguide,
      category: data.category,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  revalidatePath("/");
  revalidatePath("/arrangements");
  revalidatePath("/flowers");
  revalidatePath("/products");
  redirect("/admin/products");
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
  revalidatePath("/arrangements");
  revalidatePath("/flowers");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({
    where: {
      id,
    },
  });
  if (product == null) {
    return notFound();
  }

  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);

  revalidatePath("/");
  revalidatePath("/arrangements");
  revalidatePath("/flowers");
  revalidatePath("/products");
  redirect("/admin/products");
}
