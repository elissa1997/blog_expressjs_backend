const articleModel = require('../models/article.model');
const { parsePagination, formatPagination, toDbOffset } = require('../utils/pagination');

function parseSearch(search) {
  if (!search) {
    return {};
  }

  if (typeof search === 'object') {
    return search;
  }

  try {
    const parsed = JSON.parse(search);
    for (const field of ['category', 'status']) {
      if (parsed[field] !== undefined && typeof parsed[field] !== 'string') {
        const error = new Error(`search.${field} 类型必须为 string`);
        error.status = 400;
        throw error;
      }
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

async function list(query) {
  const { offset, limits } = parsePagination(query);
  const search = parseSearch(query.search);
  const dbOffset = toDbOffset(offset, limits);
  const result = await articleModel.list({ offset: dbOffset, limits, search });
  return formatPagination(result.list, result.total, offset, limits);
}

async function detail(query) {
  return articleModel.detail({ id: Number.parseInt(query.a_id, 10) });
}

async function add(payload) {
  return articleModel.add(payload);
}

async function update(payload) {
  const hasUpdateField = ['title', 'cover', 'content', 'category', 'status']
    .some((key) => payload[key] !== undefined);

  if (!hasUpdateField) {
    const error = new Error('至少需要一个可更新字段');
    error.status = 400;
    throw error;
  }

  const updated = await articleModel.update({
    ...payload,
    a_id: Number.parseInt(payload.a_id, 10)
  });
  if (!updated) {
    const error = new Error('文章不存在');
    error.status = 404;
    throw error;
  }

  return true;
}

async function remove(payload) {
  const normalizedIds = [...new Set(
    payload.id.map((id) => Number.parseInt(id, 10))
  )];

  const removed = await articleModel.remove({ ids: normalizedIds });
  if (!removed) {
    const error = new Error('文章不存在');
    error.status = 404;
    throw error;
  }

  return true;
}

module.exports = {
  list,
  detail,
  add,
  update,
  remove
};
