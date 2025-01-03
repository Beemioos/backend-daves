/*
  Warnings:

  - You are about to drop the `BasketOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BasketOrder` DROP FOREIGN KEY `BasketOrder_basketId_fkey`;

-- DropForeignKey
ALTER TABLE `BasketOrder` DROP FOREIGN KEY `BasketOrder_orderId_fkey`;

-- DropTable
DROP TABLE `BasketOrder`;

-- CreateTable
CREATE TABLE `_BasketOrder` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BasketOrder_AB_unique`(`A`, `B`),
    INDEX `_BasketOrder_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_BasketOrder` ADD CONSTRAINT `_BasketOrder_A_fkey` FOREIGN KEY (`A`) REFERENCES `Basket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BasketOrder` ADD CONSTRAINT `_BasketOrder_B_fkey` FOREIGN KEY (`B`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
