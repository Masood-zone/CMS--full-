-- DropIndex
DROP INDEX "Record_payedBy_submitedAt_key";

-- CreateIndex
CREATE INDEX "Record_payedBy_submitedAt_idx" ON "Record"("payedBy", "submitedAt");
