-- CreateTable
CREATE TABLE "DeliveryFeeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "basePostalCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "distanceFeePerKm" INTEGER
);

-- CreateTable
CREATE TABLE "CustomDeliveryRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postalCodePrefix" TEXT NOT NULL,
    "feeInCents" INTEGER NOT NULL,
    "deliveryFeeConfigId" TEXT NOT NULL,
    CONSTRAINT "CustomDeliveryRule_deliveryFeeConfigId_fkey" FOREIGN KEY ("deliveryFeeConfigId") REFERENCES "DeliveryFeeConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
