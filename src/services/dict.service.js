const dictModel = require('../models/dict.model');
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
    return { dict_type: search };
  }
}

async function add(payload) {
  const value = payload.value.trim();
  const existed = await dictModel.findByType({
    dict_type: payload.dict_type,
    value,
    exact: true,
    offset: 0,
    limits: 1
  });

  if (existed.total > 0) {
    const error = new Error('当前 dict_type 下 value 已存在');
    error.status = 409;
    throw error;
  }

  return dictModel.add({ ...payload, value });
}

async function list(query) {
  const { offset, limits } = parsePagination(query);
  const search = parseSearch(query.search);
  const dbOffset = toDbOffset(offset, limits);
  const result = await dictModel.list({ offset: dbOffset, limits, search });
  return formatPagination(result.list, result.total, offset, limits);
}

async function findByType(query) {
  const { offset, limits } = parsePagination(query);
  const dbOffset = toDbOffset(offset, limits);
  const result = await dictModel.findByType({
    dict_type: query.dict_type,
    offset: dbOffset,
    limits
  });
  return formatPagination(result.list, result.total, offset, limits);
}

async function update(payload) {
  const hasId = payload && payload.id !== undefined && payload.id !== null && payload.id !== '';

  if (hasId) {
    const id = Number.parseInt(payload.id, 10);
    const value = payload.value.trim();

    const existing = await dictModel.findOneById(id);
    if (!existing) {
      const error = new Error('字典项不存在');
      error.status = 404;
      throw error;
    }

    const conflict = await dictModel.findValueConflict({
      dict_type: payload.dict_type,
      value,
      excludeId: id
    });

    if (conflict) {
      const error = new Error('当前 dict_type 下 value 已存在');
      error.status = 409;
      throw error;
    }

    const updated = await dictModel.update({
      mode: 'single',
      id,
      dict_type: payload.dict_type,
      name: payload.name,
      value
    });

    if (!updated) {
      const error = new Error('字典项不存在');
      error.status = 404;
      throw error;
    }

    return true;
  }

  const targetTypeExists = await dictModel.existsByDictType(payload.update_dict_type);
  if (targetTypeExists) {
    const error = new Error('update_dict_type 已存在，不能重复');
    error.status = 409;
    throw error;
  }

  const updated = await dictModel.update({
    mode: 'type',
    dict_type: payload.dict_type,
    update_dict_type: payload.update_dict_type
  });

  if (!updated) {
    const error = new Error('字典类型不存在');
    error.status = 404;
    throw error;
  }

  return true;
}

async function remove(payload) {
  const hasIdField = Object.prototype.hasOwnProperty.call(payload, 'id');

  if (hasIdField) {
    const ids = [...new Set(
      payload.id
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isInteger(id))
    )];

    const removed = await dictModel.remove({
      mode: 'id',
      id: ids
    });

    if (!removed) {
      const error = new Error('字典项不存在');
      error.status = 404;
      throw error;
    }

    return true;
  }

  const dictTypes = [...new Set(
    payload.dict_type.map((item) => item.trim())
  )];

  const removed = await dictModel.remove({
    mode: 'dict_type',
    dict_type: dictTypes
  });

  if (!removed) {
    const error = new Error('字典类型不存在');
    error.status = 404;
    throw error;
  }

  return true;
}

module.exports = {
  add,
  list,
  findByType,
  update,
  remove
};
