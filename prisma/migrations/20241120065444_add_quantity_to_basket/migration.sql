/*
  Warnings:

  - You are about to drop the `_BasketOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_BasketOrder` DROP FOREIGN KEY `_BasketOrder_A_fkey`;

-- DropForeignKey
ALTER TABLE `_BasketOrder` DROP FOREIGN KEY `_BasketOrder_B_fkey`;

-- DropTable
DROP TABLE `_BasketOrder`;

-- CreateTable
CREATE TABLE `BasketOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `basketId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `BasketOrder_basketId_orderId_key`(`basketId`, `orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BasketOrder` ADD CONSTRAINT `BasketOrder_basketId_fkey` FOREIGN KEY (`basketId`) REFERENCES `Basket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BasketOrder` ADD CONSTRAINT `BasketOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
