const userModel = require('../models/user.model');
const { hashPassword } = require('../utils/bcrypt');
const { parsePagination, formatPagination, toDbOffset } = require('../utils/pagination');

function parseSearch(search) {
  if (!search) {
    return {};
  }

  if (typeof search === 'object') {
    return search;
  }

  try {
    return JSON.parse(search);
  } catch (err) {
    return { keyword: search };
  }
}

function throwUniqueConflict(err) {
  if (err && err.code === 'P2002') {
    const error = new Error('用户名或邮箱已存在');
    error.status = 409;
    throw error;
  }
  throw err;
}

async function list(query) {
  const { offset, limits } = parsePagination(query);
  const search = parseSearch(query.search);
  const result = await userModel.list({
    offset: toDbOffset(offset, limits),
    limits,
    search
  });
  return formatPagination(result.list, result.total, offset, limits);
}

async function detail(query) {
  const user = await userModel.detail(Number.parseInt(query.id, 10));
  if (!user) {
    const error = new Error('用户不存在');
    error.status = 404;
    throw error;
  }
  return user;
}

async function add(payload) {
  try {
    return await userModel.create({
      ...payload,
      password: await hashPassword(payload.password)
    });
  } catch (err) {
    return throwUniqueConflict(err);
  }
}

async function update(payload) {
  const data = {
    ...payload,
    id: Number.parseInt(payload.id, 10)
  };

  if (payload.password !== undefined) {
    data.password = await hashPassword(payload.password);
  }

  try {
    return await userModel.update(data);
  } catch (err) {
    if (err && err.code === 'P2025') {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }
    return throwUniqueConflict(err);
  }
}

async function remove(payload, currentUser) {
  const ids = [...new Set(payload.id.map((id) => Number.parseInt(id, 10)))];

  if (ids.includes(Number.parseInt(currentUser.id, 10))) {
    const error = new Error('不能删除当前登录用户');
    error.status = 400;
    throw error;
  }

  const removedCount = await userModel.remove(ids);
  if (removedCount === 0) {
    const error = new Error('用户不存在');
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
