-- Align all dict-backed business fields with dict.value without changing their values.
-- Back up the affected tables before running this one-time migration in production.
ALTER TABLE `article`
  MODIFY COLUMN `category` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  MODIFY COLUMN `status` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0';

ALTER TABLE `comment`
  MODIFY COLUMN `status` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0';

ALTER TABLE `friendlink`
  MODIFY COLUMN `status` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0';
