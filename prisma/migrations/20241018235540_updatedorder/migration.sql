-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryDate" DATETIME;
ALTER TABLE "Order" ADD COLUMN "deliveryInstructions" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryTime" TEXT;
ALTER TABLE "Order" ADD COLUMN "isDelivery" BOOLEAN DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "recipientName" TEXT;
