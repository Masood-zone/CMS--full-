/*
  Warnings:

  - A unique constraint covering the columns `[payedBy,submitedAt]` on the table `Record` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Record_payedBy_submitedAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Record_payedBy_submitedAt_key" ON "Record"("payedBy", "submitedAt");
