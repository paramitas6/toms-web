// src/app/admin/products/page.tsx

import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import db from "@/db/db";
import { CheckCircle2, MoreVertical, XCircle, Star } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
  ToggleFeaturedDropdownItem,
} from "./_components/ProductActions";

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href="/admin/products/new">Create Product</Link>
        </Button>
      </div>
      <div className="mt-8">
        <ProductsTable />
      </div>
    </>
  );
}

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      isAvailableForPurchase: true,
      featuredProducts: {
        select: { id: true },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
      sizes: {
        select: {
          priceInCents: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  if (products.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">
            <span className="sr-only">Available For Purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price Range</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const isFeatured = product.featuredProducts.length > 0;
          const variantPrices = product.sizes.map((size) => size.priceInCents);
          const minPrice = Math.min(...variantPrices);
          const maxPrice = Math.max(...variantPrices);
          const priceRange =
            minPrice === maxPrice
              ? formatCurrency(minPrice / 100)
              : `${formatCurrency(minPrice / 100)} - ${formatCurrency(maxPrice / 100)}`;
          return (
            <TableRow key={product.id}>
              <TableCell>
                {product.isAvailableForPurchase ? (
                  <>
                    <span className="sr-only"> Available</span>
                    <CheckCircle2 className="text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="sr-only"> Unavailable</span>
                    <XCircle className="text-red-500" />
                  </>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{priceRange}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                {isFeatured ? (
                  <Star className="text-yellow-500" />
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </TableCell>
              <TableCell>{formatNumber(product._count.orderItems)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <a download href={`/admin/products/${product.id}/download`}>
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <ActiveToggleDropdownItem
                      id={product.id}
                      isAvailableForPurchase={product.isAvailableForPurchase}
                    />
                    <ToggleFeaturedDropdownItem
                      id={product.id}
                      isFeatured={isFeatured}
                    />
                    <DropdownMenuSeparator />
                    <DeleteDropdownItem
                      id={product.id}
                      disabled={product._count.orderItems > 0}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
