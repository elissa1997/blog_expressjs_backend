const commentModel = require('../models/comment.model');
const { parsePagination } = require('../utils/pagination');
const { CONTENT_STATUS_VALUES } = require('../constants/content-status');

function parseSearch(search) {
  if (!search) {
    return {};
  }

  if (typeof search === 'object') {
    return search;
  }

  try {
    const parsed = JSON.parse(search);
    if (parsed.status !== undefined && typeof parsed.status !== 'string') {
      const error = new Error('search.status 类型必须为 string');
      error.status = 400;
      throw error;
    }
    if (parsed.status !== undefined && !CONTENT_STATUS_VALUES.includes(parsed.status.trim())) {
      const error = new Error(`search.status 必须为 ${CONTENT_STATUS_VALUES.join('/')}`);
      error.status = 400;
      throw error;
    }
    return parsed;
  } catch (err) {
    if (err && err.status === 400) {
      throw err;
    }
    const error = new Error('search 参数格式错误');
    error.status = 400;
    throw error;
  }
}

async function add(payload) {
  return commentModel.add(payload);
}

async function list(query) {
  return commentModel.list(query);
}

async function adminList(query) {
  if (query.search !== undefined) {
    parseSearch(query.search);
  }
  return commentModel.adminList(query);
}

async function remove(payload) {
  const removed = await commentModel.remove(payload);
  if (!removed) {
    const error = new Error('评论不存在');
    error.status = 404;
    throw error;
  }

  return removed;
}

async function update(payload) {
  const updated = await commentModel.update(payload);
  if (!updated) {
    const error = new Error('评论不存在');
    error.status = 404;
    throw error;
  }

  return updated;
}

module.exports = {
  add,
  list,
  adminList,
  remove,
  update
};
