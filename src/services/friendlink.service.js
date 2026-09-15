const friendlinkModel = require('../models/friendlink.model');
const { reviewText, pickSuggestion } = require('../utils/qiniu-text-review');
const { normalizeName, normalizeUrl, hashUrl } = require('../utils/friendlink');
const { CONTENT_STATUS, CONTENT_STATUS_VALUES } = require('../constants/content-status');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function resolveSuggestion(result) {
  if (result.skipped) throw createError('七牛内容审核未配置', 502);

  const suggestion = pickSuggestion(result);
  if (suggestion === 'pass' || suggestion === 'review') return suggestion;
  if (suggestion === 'block') {
    throw createError('友情链接包含违规内容，提交失败', 403);
  }
  throw createError('七牛内容审核返回未知结果', 502);
}

async function add(payload) {
  const name = normalizeName(payload.name);
  const url = normalizeUrl(payload.url);
  const urlHash = hashUrl(url);

  if (await friendlinkModel.findByUrlHash(urlHash)) {
    throw createError('该友情链接已存在', 409);
  }

  const reviewResult = await reviewText(name);
  const qiniuSuggestion = resolveSuggestion(reviewResult);

  try {
    const created = await friendlinkModel.add({
      name,
      url,
      urlHash,
      status: CONTENT_STATUS.HIDE,
      qiniuSuggestion,
      sort: 0,
      ip: payload.ip || '127.0.0.1',
      agent: payload.agent || 'unknow'
    });
    return { id: created.id, status: created.status };
  } catch (err) {
    if (err && err.code === 'P2002') {
      throw createError('该友情链接已存在', 409);
    }
    throw err;
  }
}

async function list(query) {
  return friendlinkModel.list(query);
}

async function adminList(query) {
  return friendlinkModel.adminList(query);
}

async function update(payload) {
  const id = Number.parseInt(payload.id, 10);
  if (!Number.isInteger(id) || id <= 0) throw createError('友情链接 ID 不正确', 400);
  const existing = await friendlinkModel.findById(id);
  if (!existing) throw createError('友情链接不存在', 404);

  const data = {};
  if (payload.name !== undefined) data.name = normalizeName(payload.name);
  if (payload.status !== undefined) {
    const status = payload.status.trim();
    if (!CONTENT_STATUS_VALUES.includes(status)) throw createError('友情链接状态不正确', 400);
    data.status = status;
  }
  if (payload.sort !== undefined) {
    const sort = Number.parseInt(payload.sort, 10);
    if (!Number.isInteger(sort)) throw createError('友情链接排序值不正确', 400);
    data.sort = sort;
  }

  if (payload.url !== undefined) {
    const url = normalizeUrl(payload.url);
    const urlHash = hashUrl(url);
    const duplicate = await friendlinkModel.findByUrlHash(urlHash);
    if (duplicate && duplicate.id !== id) {
      throw createError('该友情链接已存在', 409);
    }
    data.url = url;
    data.urlHash = urlHash;
  }

  if (Object.keys(data).length === 0) {
    throw createError('至少需要提供一个可修改字段', 400);
  }

  try {
    await friendlinkModel.update(id, data);
    return true;
  } catch (err) {
    if (err && err.code === 'P2002') {
      throw createError('该友情链接已存在', 409);
    }
    if (err && err.code === 'P2025') {
      throw createError('友情链接不存在', 404);
    }
    throw err;
  }
}

async function remove(payload) {
  const ids = [...new Set(payload.id.map((id) => Number.parseInt(id, 10)))];
  if (ids.length === 0 || ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw createError('友情链接 ID 不正确', 400);
  }
  const removed = await friendlinkModel.remove(ids);
  if (!removed) throw createError('友情链接不存在', 404);
  return true;
}

module.exports = {
  resolveSuggestion,
  add,
  list,
  adminList,
  update,
  remove
};
