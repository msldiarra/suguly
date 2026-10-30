-- CreateTable: BusinessVerification (SQLite)
-- status values: PENDING | WAITING_DOCS | DOCS_RECEIVED | APPROVED | REJECTED
CREATE TABLE IF NOT EXISTS "BusinessVerification" (
    "id"             INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessName"   TEXT NOT NULL,
    "ownerName"      TEXT NOT NULL,
    "phone"          TEXT NOT NULL,
    "quartier"       TEXT,
    "description"    TEXT,
    "status"         TEXT NOT NULL DEFAULT 'PENDING',
    "whatsappSentAt" DATETIME,
    "docsReceivedAt" DATETIME,
    "resolvedAt"     DATETIME,
    "adminNote"      TEXT,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BusinessVerification_status_idx" ON "BusinessVerification"("status");
