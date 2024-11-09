// src/app/admin/products/[id]/edit/page.tsx

import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";
import { Product, Image as PrismaImage } from "@prisma/client";

interface ProductWithImages extends Product {
  images?: PrismaImage[];
}

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({
    where: { id },
    include: { images: true }, // Include images
  });

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product as ProductWithImages} />
    </>
  );
}
