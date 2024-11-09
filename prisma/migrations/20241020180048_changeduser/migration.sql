-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pricePaidInCents" INTEGER NOT NULL,
    "userId" TEXT,
    "isDelivery" BOOLEAN DEFAULT false,
    "recipientName" TEXT,
    "deliveryAddress" TEXT,
    "deliveryInstructions" TEXT,
    "postalCode" TEXT,
    "notes" TEXT,
    "deliveryDate" DATETIME,
    "deliveryTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CART',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "deliveryAddress", "deliveryDate", "deliveryInstructions", "deliveryTime", "id", "isDelivery", "notes", "postalCode", "pricePaidInCents", "recipientName", "status", "updatedAt", "userId") SELECT "createdAt", "deliveryAddress", "deliveryDate", "deliveryInstructions", "deliveryTime", "id", "isDelivery", "notes", "postalCode", "pricePaidInCents", "recipientName", "status", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
