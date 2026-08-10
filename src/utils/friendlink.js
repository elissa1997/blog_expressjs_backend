const crypto = require('crypto');

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || name.length > 100) {
    throw validationError('站点名称长度必须为 1-100 个字符');
  }
  return name;
}

function isValidFriendlinkUrl(value) {
  if (typeof value !== 'string') return false;

  const input = value.trim();
  const rootHttpsPattern = /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\/$/i;
  if (!rootHttpsPattern.test(input)) return false;

  try {
    const parsed = new URL(input);
    return parsed.protocol === 'https:' &&
      parsed.hostname.length <= 253 &&
      parsed.pathname === '/' &&
      !parsed.port &&
      !parsed.search &&
      !parsed.hash &&
      !parsed.username &&
      !parsed.password;
  } catch (err) {
    return false;
  }
}

function normalizeUrl(value) {
  const input = typeof value === 'string' ? value.trim() : '';
  if (!isValidFriendlinkUrl(input)) {
    throw validationError('URL 必须为 https://主域名或二级域名/ 格式');
  }

  return new URL(input).toString();
}

function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

module.exports = { normalizeName, isValidFriendlinkUrl, normalizeUrl, hashUrl };
