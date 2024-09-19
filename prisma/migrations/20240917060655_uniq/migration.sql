/*
  Warnings:

  - A unique constraint covering the columns `[inn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ogrn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ogrnip]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_inn_key` ON `User`(`inn`);

-- CreateIndex
CREATE UNIQUE INDEX `User_ogrn_key` ON `User`(`ogrn`);

-- CreateIndex
CREATE UNIQUE INDEX `User_ogrnip_key` ON `User`(`ogrnip`);
