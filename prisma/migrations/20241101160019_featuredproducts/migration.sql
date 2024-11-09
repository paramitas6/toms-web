-- AlterTable
ALTER TABLE "Order" ADD COLUMN "category" TEXT;

-- CreateTable
CREATE TABLE "FeaturedProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "featuredUntil" DATETIME,
    CONSTRAINT "FeaturedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FeaturedProduct_productId_idx" ON "FeaturedProduct"("productId");
