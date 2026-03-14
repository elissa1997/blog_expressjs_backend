const dictService = require('../services/dict.service');

async function add(req, res, next) {
  try {
    const result = await dictService.add(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const result = await dictService.list(req.query);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function findByType(req, res, next) {
  try {
    const result = await dictService.findByType(req.query);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await dictService.update(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await dictService.remove(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  add,
  list,
  findByType,
  update,
  remove
};
