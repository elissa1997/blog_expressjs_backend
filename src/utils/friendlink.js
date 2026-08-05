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

function normalizeUrl(value) {
  const input = typeof value === 'string' ? value.trim() : '';
  if (!input || input.length > 2048) {
    throw validationError('URL 长度必须为 1-2048 个字符');
  }

  let parsed;
  try {
    parsed = new URL(input);
  } catch (err) {
    throw validationError('URL 格式不正确');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw validationError('URL 仅支持 http 或 https 协议');
  }

  if (!parsed.hostname || parsed.username || parsed.password) {
    throw validationError('URL 格式不正确');
  }

  parsed.hash = '';
  const normalized = parsed.toString();
  if (normalized.length > 2048) {
    throw validationError('URL 长度不能超过 2048 个字符');
  }
  return normalized;
}

function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex');
}

module.exports = { normalizeName, normalizeUrl, hashUrl };
