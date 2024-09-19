/*
  Warnings:

  - Added the required column `dateReceipt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTransfer` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `dateReceipt` DATETIME(3) NOT NULL,
    ADD COLUMN `dateTransfer` DATETIME(3) NOT NULL;
