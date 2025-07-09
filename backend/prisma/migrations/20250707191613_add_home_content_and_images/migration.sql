/*
  Warnings:

  - A unique constraint covering the columns `[section,key]` on the table `HomeContent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `HomeImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `section` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `HomeContent_section_key_key` ON `HomeContent`(`section`, `key`);
