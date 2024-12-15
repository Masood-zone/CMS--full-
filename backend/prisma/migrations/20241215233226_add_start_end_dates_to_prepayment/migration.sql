/*
  Warnings:

  - You are about to drop the column `dateRange` on the `Prepayment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prepayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numberOfDays" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prepayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prepayment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prepayment" ("amount", "classId", "createdAt", "id", "numberOfDays", "studentId", "updatedAt") SELECT "amount", "classId", "createdAt", "id", "numberOfDays", "studentId", "updatedAt" FROM "Prepayment";
DROP TABLE "Prepayment";
ALTER TABLE "new_Prepayment" RENAME TO "Prepayment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
