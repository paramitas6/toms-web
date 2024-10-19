/*
  Warnings:

  - You are about to drop the column `filePath` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "careguide" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "isAvailableForPurchase" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Product" ("careguide", "category", "createdAt", "description", "id", "imagePath", "isAvailableForPurchase", "name", "priceInCents", "stock", "updatedAt") SELECT "careguide", "category", "createdAt", "description", "id", "imagePath", "isAvailableForPurchase", "name", "priceInCents", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
