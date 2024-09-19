/*
  Warnings:

  - A unique constraint covering the columns `[inn]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_inn_key` ON `User`(`inn`);
