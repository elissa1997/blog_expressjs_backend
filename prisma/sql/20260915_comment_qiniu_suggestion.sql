-- Add the Qiniu review suggestion and mark all existing comments as passed.
-- Back up the comment table before running this one-time migration in production.
ALTER TABLE `comment`
  ADD COLUMN `qiniuSuggestion` VARCHAR(16)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci
  NOT NULL DEFAULT 'pass'
  AFTER `agent`;
