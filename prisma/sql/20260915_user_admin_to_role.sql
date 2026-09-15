-- Rename the administrator flag to the new string role field.
-- Back up the user table before running this one-time migration in production.
ALTER TABLE `user`
  CHANGE COLUMN `admin` `role` VARCHAR(191)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  NOT NULL DEFAULT '1';
