-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'WAITING_DOCS', 'DOCS_RECEIVED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "BusinessVerification" (
    "id"             SERIAL NOT NULL,
    "businessName"   TEXT NOT NULL,
    "ownerName"      TEXT NOT NULL,
    "phone"          TEXT NOT NULL,
    "quartier"       TEXT,
    "description"    TEXT,
    "status"         "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "whatsappSentAt" TIMESTAMP(3),
    "docsReceivedAt" TIMESTAMP(3),
    "resolvedAt"     TIMESTAMP(3),
    "adminNote"      TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessVerification_status_idx" ON "BusinessVerification"("status");
