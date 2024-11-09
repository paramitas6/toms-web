-- CreateTable
CREATE TABLE "HomeSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "backgroundImage" TEXT NOT NULL,
    "overlayText" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
