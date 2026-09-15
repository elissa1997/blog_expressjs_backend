-- Use the hidden state when a status is omitted without changing existing rows.
ALTER TABLE `article`
  MODIFY COLUMN `status` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hide';

ALTER TABLE `comment`
  MODIFY COLUMN `status` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hide';

ALTER TABLE `friendlink`
  MODIFY COLUMN `status` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hide';
