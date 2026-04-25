ALTER TABLE "Product" RENAME COLUMN "price" TO "basePrice";
ALTER TABLE "Product" ADD COLUMN "price" REAL NOT NULL DEFAULT 0;

UPDATE "Product"
SET "price" = CAST((("basePrice" * 1.10) + 999) / 1000 AS INT) * 1000;
