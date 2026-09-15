-- Convert existing integer values to their string representations in place.
-- Back up the dict table before running this one-time migration in production.
ALTER TABLE `dict`
  MODIFY COLUMN `value` VARCHAR(191)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  NOT NULL DEFAULT '0';
