const othercommentModel = require('../models/othercomment.model');

async function add(payload) {
  return othercommentModel.add(payload);
}

async function list(query) {
  return othercommentModel.list(query);
}

async function adminList(query) {
  return othercommentModel.adminList(query);
}

async function remove(payload) {
  const normalizedIds = [...new Set(
    payload.id.map((id) => Number.parseInt(id, 10))
  )];

  const removed = await othercommentModel.remove({ ...payload, id: normalizedIds });
  if (!removed) {
    const error = new Error('评论不存在');
    error.status = 404;
    throw error;
  }

  return true;
}

async function update(payload) {
  const updated = await othercommentModel.update(payload);
  if (!updated) {
    const error = new Error('评论不存在');
    error.status = 404;
    throw error;
  }

  return true;
}

module.exports = {
  add,
  list,
  adminList,
  remove,
  update
};
